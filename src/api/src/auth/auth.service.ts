import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.createUser({
      email: dto.email,
      name: dto.name,
      passwordHash,
      googleId: null,
      avatarUrl: null,
    });

    this.logger.log(`User registered: userId=${user.id}`);
    return { accessToken: this.signToken(user.id, user.email) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user || !user.passwordHash) {
      this.logger.warn(`Login failed: unknown email or no password set`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      this.logger.warn(`Login failed: wrong password for userId=${user.id}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.log(`Login success: userId=${user.id}`);
    return { accessToken: this.signToken(user.id, user.email) };
  }

  async googleAuth(idToken: string): Promise<{ accessToken: string }> {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      this.logger.warn('Google ID token verification failed');
      throw new UnauthorizedException('Token de Google inválido');
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Token de Google inválido');
    }

    const user = await this.usersService.findOrCreateByGoogle({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture || null,
    });

    this.logger.log(`Google auth success: userId=${user.id}`);
    return { accessToken: this.signToken(user.id, user.email) };
  }

  private signToken(userId: number, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
