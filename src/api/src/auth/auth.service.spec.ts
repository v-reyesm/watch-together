/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  function mockVerifyIdToken(payload: {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  }) {
    const googleClient = authService as AuthService & {
      googleClient: {
        verifyIdToken: (args: unknown) => unknown;
      };
    };

    jest.spyOn(googleClient.googleClient, 'verifyIdToken').mockResolvedValue({
      getPayload: () => payload,
    } as never);
  }

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      createUser: jest.fn(),
      findOrCreateByGoogle: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-google-client-id'),
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return a JWT', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.createUser!.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test',
      });

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(usersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'Test',
          googleId: null,
          avatarUrl: null,
        }),
      );
      const createCall = usersService.createUser!.mock.calls[0][0];
      expect(createCall.passwordHash).toBeDefined();
      expect(createCall.passwordHash).not.toBe('password123');
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash the password with bcrypt', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.createUser!.mockImplementation(async (data) => ({
        id: 1,
        ...data,
      }));

      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

      const createCall = usersService.createUser!.mock.calls[0][0];
      const isHashed = await bcrypt.compare(
        'password123',
        createCall.passwordHash,
      );
      expect(isHashed).toBe(true);
    });
  });

  describe('login', () => {
    it('should return a JWT for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      usersService.findByEmailWithPassword!.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: hash,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      usersService.findByEmailWithPassword!.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correctpassword', 10);
      usersService.findByEmailWithPassword!.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: hash,
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for user without password (Google-only)', async () => {
      usersService.findByEmailWithPassword!.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: null,
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return generic error message (no user enumeration)', async () => {
      usersService.findByEmailWithPassword!.mockResolvedValue(null);

      try {
        await authService.login({
          email: 'unknown@example.com',
          password: 'password123',
        });
      } catch (e) {
        expect((e as UnauthorizedException).message).toBe(
          'Credenciales inválidas',
        );
      }
    });
  });

  describe('googleAuth', () => {
    it('should reject Google tokens with unverified email', async () => {
      mockVerifyIdToken({
        sub: 'google-user-1',
        email: 'test@example.com',
        email_verified: false,
        name: 'Test User',
      });

      await expect(authService.googleAuth('google-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOrCreateByGoogle).not.toHaveBeenCalled();
    });

    it('should create or reuse user for verified Google token', async () => {
      mockVerifyIdToken({
        sub: 'google-user-1',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      });
      usersService.findOrCreateByGoogle!.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      const result = await authService.googleAuth('google-token');

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(usersService.findOrCreateByGoogle).toHaveBeenCalledWith({
        googleId: 'google-user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
    });

    it('should throw UnauthorizedException for invalid idToken', async () => {
      await expect(authService.googleAuth('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
