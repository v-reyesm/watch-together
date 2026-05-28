/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD, Reflector } from '@nestjs/core';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Repository,
} from 'typeorm';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtPayload, JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { UsersService } from '../src/users/users.service';
import { UsersController } from '../src/users/users.controller';
import { GlobalJwtAuthGuard } from '../src/auth/guards/global-jwt-auth.guard';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { User } from '../src/users/entities/user.entity';

@Entity({ name: 'users' })
class TestUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

const JWT_SECRET = 'test-jwt-secret-for-e2e';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersRepo: Repository<TestUser>;

  const expectTokenForUser = async (token: string, email: string) => {
    const payload = jwtService.verify<JwtPayload>(token);
    const user = await usersRepo.findOneByOrFail({ email });

    expect(payload).toMatchObject({
      sub: user.id,
      email: user.email,
    });

    return user;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET,
              JWT_EXPIRES_IN: '1h',
              GOOGLE_CLIENT_ID: 'test-google-client-id',
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [TestUser],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([TestUser]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController, UsersController],
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useFactory: (ds: DataSource) => ds.getRepository(TestUser),
          inject: [DataSource],
        },
        UsersService,
        {
          provide: APP_GUARD,
          useClass: GlobalJwtAuthGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());

    const reflector = app.get(Reflector);
    app.useGlobalGuards(new GlobalJwtAuthGuard(reflector));

    jwtService = moduleFixture.get<JwtService>(JwtService);
    usersRepo = moduleFixture.get<Repository<TestUser>>(
      getRepositoryToken(User),
    );
    await app.init();
  }, 30_000);

  afterAll(async () => {
    if (app) await app.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(typeof res.body.accessToken).toBe('string');
      await expectTokenForUser(res.body.accessToken, 'new@example.com');
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'dup@example.com',
          password: 'password123',
          name: 'Dup',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'dup@example.com',
          password: 'password123',
          name: 'Dup',
        })
        .expect(409);

      expect(res.body.message).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123', name: 'Test' })
        .expect(400);
    });

    it('should reject short password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'short@example.com', password: '123', name: 'Test' })
        .expect(400);
    });

    it('should reject missing name', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'noname@example.com', password: 'password123' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      await expectTokenForUser(res.body.accessToken, 'login@example.com');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toBe('Credenciales inválidas');
    });

    it('should return 401 for unknown email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'password123' })
        .expect(401);

      expect(res.body.message).toBe('Credenciales inválidas');
    });

    it('should return 401 for a Google-only account without password', async () => {
      await usersRepo.save(
        usersRepo.create({
          email: 'google-only@example.com',
          name: 'Google Only',
          passwordHash: null,
          avatarUrl: null,
          googleId: 'google-only-sub',
        }),
      );

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'google-only@example.com', password: 'password123' })
        .expect(401);

      expect(res.body.message).toBe('Credenciales inválidas');
    });
  });

  describe('POST /api/auth/google', () => {
    it('should create a user from a valid Google token and return JWT', async () => {
      const verifyIdTokenSpy = jest
        .spyOn(OAuth2Client.prototype, 'verifyIdToken')
        .mockResolvedValue({
          getPayload: () => ({
            sub: 'google-sub-123',
            email: 'google@example.com',
            email_verified: true,
            name: 'Google User',
            picture: 'https://example.com/avatar.png',
          }),
        } as never);

      const res = await request(app.getHttpServer())
        .post('/api/auth/google')
        .send({ idToken: 'valid-google-token' })
        .expect(200);

      expect(verifyIdTokenSpy).toHaveBeenCalledWith({
        idToken: 'valid-google-token',
        audience: 'test-google-client-id',
      });
      expect(res.body.accessToken).toBeDefined();

      const user = await expectTokenForUser(
        res.body.accessToken,
        'google@example.com',
      );
      expect(user.googleId).toBe('google-sub-123');
      expect(user.avatarUrl).toBe('https://example.com/avatar.png');
      expect(user.passwordHash).toBeNull();
    });

    it('should link Google auth to an existing account with the same email', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'linked@example.com',
          password: 'password123',
          name: 'Linked User',
        })
        .expect(201);

      const existingUser = await expectTokenForUser(
        registerRes.body.accessToken,
        'linked@example.com',
      );
      const totalUsersBefore = await usersRepo.count();

      jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
        getPayload: () => ({
          sub: 'google-linked-sub',
          email: 'linked@example.com',
          email_verified: true,
          name: 'Different Google Name',
          picture: 'https://example.com/linked-avatar.png',
        }),
      } as never);

      const googleRes = await request(app.getHttpServer())
        .post('/api/auth/google')
        .send({ idToken: 'link-existing-user-token' })
        .expect(200);

      const linkedUser = await expectTokenForUser(
        googleRes.body.accessToken,
        'linked@example.com',
      );
      const totalUsersAfter = await usersRepo.count();

      expect(totalUsersAfter).toBe(totalUsersBefore);
      expect(linkedUser.id).toBe(existingUser.id);
      expect(linkedUser.googleId).toBe('google-linked-sub');
      expect(linkedUser.avatarUrl).toBe(
        'https://example.com/linked-avatar.png',
      );
      expect(linkedUser.name).toBe('Linked User');
    });

    it('should return 401 for invalid Google token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/google')
        .send({ idToken: 'invalid-google-token' })
        .expect(401);

      expect(res.body.message).toBe('Token de Google inválido');
    });
  });

  describe('GET /api/users/me', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });

    it('should return user profile with valid token', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'me@example.com',
          password: 'password123',
          name: 'Me User',
        });

      const token = registerRes.body.accessToken;

      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.email).toBe('me@example.com');
      expect(res.body.name).toBe('Me User');
      expect(res.body.id).toBeDefined();
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 999, email: 'expired@test.com' },
        { expiresIn: '0s' },
      );

      await new Promise((r) => setTimeout(r, 1100));

      await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
