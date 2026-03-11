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
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
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
    await app.init();
  }, 30_000);

  afterAll(async () => {
    if (app) await app.close();
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
  });

  describe('POST /api/auth/google', () => {
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
