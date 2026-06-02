/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Repository,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { GlobalJwtAuthGuard } from '../src/auth/guards/global-jwt-auth.guard';
import { Media } from '../src/media/entities/media.entity';
import { User } from '../src/users/entities/user.entity';
import { WatchEvent } from '../src/watch-list/entities/watch-event.entity';
import { WatchListMember } from '../src/watch-list/entities/watch-list-member.entity';
import { WatchList } from '../src/watch-list/entities/watch-list.entity';
import { WatchListController } from '../src/watch-list/watch-list.controller';
import { WatchListService } from '../src/watch-list/watch-list.service';
import { Invite } from '../src/invites/entities/invite.entity';
import { InvitesController } from '../src/invites/invites.controller';
import { InvitesService } from '../src/invites/invites.service';

const JWT_SECRET = 'test-jwt-secret-for-watch-list-e2e';

type ListResponseBody = {
  id: number;
};

type InviteResponseBody = {
  token: string;
  watchListId: number;
  status: string;
};

type WatchListResponseBody = {
  id: number;
  name: string;
  members: unknown[];
};

@Entity({ name: 'users' })
class TestUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  @OneToMany(() => TestWatchListMember, (m) => m.user)
  watchListMembers: TestWatchListMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity({ name: 'media' })
class TestMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  translatedTitle: string;

  @Column({ type: 'datetime' })
  releaseDate: Date;

  @Column()
  posterUrl: string;

  @Column()
  overview: string;

  @Column({ nullable: true })
  originalLanguage?: string;

  @Column({ type: 'float', nullable: true })
  rating?: number;

  @Column({ nullable: true })
  tmdbId?: number;

  @Column({ type: 'varchar', length: 30, default: 'tmdb' })
  providerName: 'tmdb';

  @Column({ nullable: true })
  providerId?: number;

  @Column({ type: 'varchar', length: 20, default: 'movie' })
  mediaType: 'movie' | 'tv';

  @Column({ nullable: true })
  imdbId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity({ name: 'watch_lists' })
class TestWatchList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => TestWatchListMember, (m) => m.watchList)
  watchListMembers: TestWatchListMember[];

  @ManyToMany(() => TestMedia)
  @JoinTable()
  items: TestMedia[];

  @OneToMany(() => TestWatchEvent, (e) => e.watchList)
  watchEvents: TestWatchEvent[];
}

@Entity({ name: 'watch_list_memberships' })
@Unique(['watchListId', 'userId'])
class TestWatchListMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  watchListId: number;

  @ManyToOne(() => TestWatchList, (list) => list.watchListMembers, {
    onDelete: 'CASCADE',
  })
  watchList: TestWatchList;

  @Column()
  userId: number;

  @ManyToOne(() => TestUser, (user) => user.watchListMembers, {
    onDelete: 'CASCADE',
  })
  user: TestUser;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  role: 'owner' | 'member';
}

@Entity({ name: 'watch_events' })
class TestWatchEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => TestUser, { onDelete: 'CASCADE' })
  user: TestUser;

  @Column()
  mediaId: number;

  @ManyToOne(() => TestMedia, { onDelete: 'CASCADE' })
  media: TestMedia;

  @Column({ nullable: true })
  watchListId: number | null;

  @ManyToOne(() => TestWatchList, { onDelete: 'CASCADE', nullable: true })
  watchList: TestWatchList | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  watchedAt: Date;
}

@Entity({ name: 'invites' })
class TestInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  watchListId: number;

  @ManyToOne(() => TestWatchList, { onDelete: 'CASCADE' })
  watchList: TestWatchList;

  @Column()
  createdById: number;

  @ManyToOne(() => TestUser, { onDelete: 'CASCADE' })
  createdBy: TestUser;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}

describe('Watch lists (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepo: Repository<TestUser>;
  let token: string;

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
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            TestUser,
            TestMedia,
            TestWatchList,
            TestWatchListMember,
            TestWatchEvent,
            TestInvite,
          ],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([
          TestUser,
          TestMedia,
          TestWatchList,
          TestWatchListMember,
          TestWatchEvent,
          TestInvite,
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [WatchListController, InvitesController],
      providers: [
        WatchListService,
        InvitesService,
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useExisting: getRepositoryToken(TestUser),
        },
        {
          provide: getRepositoryToken(Media),
          useExisting: getRepositoryToken(TestMedia),
        },
        {
          provide: getRepositoryToken(WatchList),
          useExisting: getRepositoryToken(TestWatchList),
        },
        {
          provide: getRepositoryToken(WatchListMember),
          useExisting: getRepositoryToken(TestWatchListMember),
        },
        {
          provide: getRepositoryToken(WatchEvent),
          useExisting: getRepositoryToken(TestWatchEvent),
        },
        {
          provide: getRepositoryToken(Invite),
          useExisting: getRepositoryToken(TestInvite),
        },
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
    userRepo = moduleFixture.get<Repository<TestUser>>(
      getRepositoryToken(TestUser),
    );

    const user = await userRepo.save(
      userRepo.create({
        email: 'owner@example.com',
        name: 'Owner User',
        passwordHash: null,
        avatarUrl: null,
        googleId: null,
      }),
    );
    token = jwtService.sign({ sub: user.id, email: user.email });

    await app.init();
  }, 30_000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('creates a list, adds an item, summarizes it, and marks it watched', async () => {
    const listRes = await request(app.getHttpServer())
      .post('/api/watch-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Noches de viernes', description: 'Peliculas para dos' })
      .expect(201);

    expect(listRes.body).toMatchObject({
      name: 'Noches de viernes',
      itemCount: 0,
      pendingCount: 0,
      watchedCount: 0,
    });
    expect(listRes.body.members[0]).toMatchObject({ role: 'owner' });

    const addRes = await request(app.getHttpServer())
      .post(`/api/watch-lists/${listRes.body.id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        providerId: 666277,
        mediaType: 'movie',
        title: 'Past Lives',
        translatedTitle: 'Past Lives',
        releaseDate: '2023-06-02',
        posterUrl: 'https://image.tmdb.org/t/p/w500/example.jpg',
        overview: 'Two childhood friends reconnect.',
        originalLanguage: 'en',
        rating: 7.8,
      })
      .expect(201);

    expect(addRes.body).toMatchObject({
      itemCount: 1,
      pendingCount: 1,
      watchedCount: 0,
    });
    expect(addRes.body.items[0]).toMatchObject({
      providerName: 'tmdb',
      providerId: 666277,
      title: 'Past Lives',
      status: 'pending',
    });

    await request(app.getHttpServer())
      .post(`/api/watch-lists/${listRes.body.id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        providerId: 666277,
        mediaType: 'movie',
        title: 'Past Lives',
      })
      .expect(409);

    const summaryRes = await request(app.getHttpServer())
      .get('/api/watch-lists/summary')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(summaryRes.body).toMatchObject({
      listCount: 1,
      itemCount: 1,
      watchedCount: 0,
      pendingCount: 1,
    });

    const itemId = addRes.body.items[0].id as number;
    const watchedRes = await request(app.getHttpServer())
      .post(`/api/watch-lists/${listRes.body.id}/items/${itemId}/watch-events`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(watchedRes.body).toMatchObject({
      pendingCount: 0,
      watchedCount: 1,
    });
    expect(watchedRes.body.items[0]).toMatchObject({
      status: 'watchedTogether',
    });
  });

  it('creates an invite and lets another user join the list', async () => {
    const listRes = await request(app.getHttpServer())
      .post('/api/watch-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lista compartida', description: 'Para invitar' })
      .expect(201);
    const listBody = listRes.body as unknown as ListResponseBody;

    const inviteRes = await request(app.getHttpServer())
      .post(`/api/watch-lists/${listBody.id}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const inviteBody = inviteRes.body as unknown as InviteResponseBody;

    expect(inviteBody).toMatchObject({
      watchListId: listBody.id,
      status: 'active',
    });
    expect(inviteBody.token).toEqual(expect.any(String));

    const partner = await userRepo.save(
      userRepo.create({
        email: 'partner@example.com',
        name: 'Partner User',
        passwordHash: null,
        avatarUrl: null,
        googleId: null,
      }),
    );
    const partnerToken = jwtService.sign({
      sub: partner.id,
      email: partner.email,
    });

    const joinRes = await request(app.getHttpServer())
      .post(`/api/invites/${inviteBody.token}/join`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .expect(201);

    expect(joinRes.body).toMatchObject({
      ok: true,
      alreadyMember: false,
      watchListId: listBody.id,
      message: 'Te uniste a la lista',
    });

    const partnerListsRes = await request(app.getHttpServer())
      .get('/api/watch-lists')
      .set('Authorization', `Bearer ${partnerToken}`)
      .expect(200);
    const partnerLists =
      partnerListsRes.body as unknown as WatchListResponseBody[];

    expect(partnerLists[0]).toMatchObject({
      id: listBody.id,
      name: 'Lista compartida',
    });
    expect(partnerLists[0].members).toHaveLength(2);
  });
});
