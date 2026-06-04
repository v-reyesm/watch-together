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
  id: number;
  token: string;
  watchListId: number;
  status: string;
};

type WatchListResponseBody = {
  id: number;
  name: string;
  members: unknown[];
  items?: Array<Record<string, unknown>>;
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

  @ManyToMany(() => TestGenre)
  @JoinTable()
  genres: TestGenre[];

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

@Entity({ name: 'genres' })
class TestGenre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  tmdbId: number;
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
  let inviteRepo: Repository<TestInvite>;
  let token: string;
  let otherToken: string;

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
            TestGenre,
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
          TestGenre,
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
    inviteRepo = moduleFixture.get<Repository<TestInvite>>(
      getRepositoryToken(TestInvite),
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

    const otherUser = await userRepo.save(
      userRepo.create({
        email: 'other@example.com',
        name: 'Other User',
        passwordHash: null,
        avatarUrl: null,
        googleId: null,
      }),
    );
    otherToken = jwtService.sign({
      sub: otherUser.id,
      email: otherUser.email,
    });

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
      summary: 'Two childhood friends reconnect.',
      genres: [],
      status: 'pending',
    });
    expect(addRes.body.items[0]).not.toHaveProperty('ranking');
    expect(addRes.body.items[0]).not.toHaveProperty('votes');

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
    const listBody = listRes.body as unknown as ListResponseBody;

    const detailRes = await request(app.getHttpServer())
      .get(`/api/watch-lists/${listBody.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detailRes.body).toMatchObject({
      id: listBody.id,
      name: 'Noches de viernes',
      description: 'Peliculas para dos',
      members: [expect.objectContaining({ role: 'owner' })],
      itemCount: 1,
      pendingCount: 1,
      watchedCount: 0,
      items: [
        expect.objectContaining({
          providerName: 'tmdb',
          providerId: 666277,
          title: 'Past Lives',
          year: 2023,
          mediaType: 'movie',
          posterUrl: 'https://image.tmdb.org/t/p/w500/example.jpg',
          summary: 'Two childhood friends reconnect.',
          overview: 'Two childhood friends reconnect.',
          genres: [],
          status: 'pending',
          watchedAt: null,
        }),
      ],
    });
    expect(detailRes.body.items[0]).not.toHaveProperty('ranking');
    expect(detailRes.body.items[0]).not.toHaveProperty('votes');

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

  it('returns 401 when list endpoints are called without auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/watch-lists/summary')
      .expect(401);

    expect(res.body).toMatchObject({
      statusCode: 401,
      message: 'Unauthorized',
    });
  });

  it('returns 403 when a non-member reads a list', async () => {
    const listRes = await request(app.getHttpServer())
      .post('/api/watch-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lista privada', description: 'Solo owner' })
      .expect(201);

    const forbiddenRes = await request(app.getHttpServer())
      .get(`/api/watch-lists/${listRes.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);

    expect(forbiddenRes.body).toMatchObject({
      statusCode: 403,
      message: 'No tienes acceso a esta lista',
    });
  });

  it('returns 404 when the requested list does not exist', async () => {
    const missingRes = await request(app.getHttpServer())
      .get('/api/watch-lists/999999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(missingRes.body).toMatchObject({
      statusCode: 404,
      message: 'Lista no encontrada',
    });
  });

  it('removes an item from a list', async () => {
    const { listId, itemId } = await createListWithItem('Lista para quitar');

    const removeRes = await request(app.getHttpServer())
      .delete(`/api/watch-lists/${listId}/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(removeRes.body).toMatchObject({
      itemCount: 0,
      pendingCount: 0,
      watchedCount: 0,
      items: [],
    });
  });

  it('undoes the latest watch event', async () => {
    const { listId, itemId } = await createListWithItem('Lista para deshacer');

    await request(app.getHttpServer())
      .post(`/api/watch-lists/${listId}/items/${itemId}/watch-events`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const undoRes = await request(app.getHttpServer())
      .delete(`/api/watch-lists/${listId}/items/${itemId}/watch-events/latest`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(undoRes.body).toMatchObject({
      pendingCount: 1,
      watchedCount: 0,
    });
    expect(undoRes.body.items[0]).toMatchObject({
      status: 'pending',
      watchedAt: null,
    });
  });

  it('lets another list member undo the latest shared watch event', async () => {
    const { listId, itemId } = await createListWithItem(
      'Lista compartida para deshacer',
    );

    const inviteRes = await request(app.getHttpServer())
      .post(`/api/watch-lists/${listId}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const inviteBody = inviteRes.body as unknown as InviteResponseBody;

    await request(app.getHttpServer())
      .post(`/api/invites/${inviteBody.token}/join`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/watch-lists/${listId}/items/${itemId}/watch-events`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const undoRes = await request(app.getHttpServer())
      .delete(`/api/watch-lists/${listId}/items/${itemId}/watch-events/latest`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);

    expect(undoRes.body).toMatchObject({
      pendingCount: 1,
      watchedCount: 0,
    });
    expect(undoRes.body.items[0]).toMatchObject({
      status: 'pending',
      watchedAt: null,
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

    const secondJoinRes = await request(app.getHttpServer())
      .post(`/api/invites/${inviteBody.token}/join`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .expect(201);

    expect(secondJoinRes.body).toMatchObject({
      ok: true,
      alreadyMember: true,
      watchListId: listBody.id,
      message: 'Ya eres parte de esta lista',
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

    await request(app.getHttpServer())
      .post(`/api/invites/${inviteBody.token}/join`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(409);
  });

  it('lists invites for the owner and revokes them', async () => {
    const listRes = await request(app.getHttpServer())
      .post('/api/watch-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lista con invitaciones', description: 'Para revisar' })
      .expect(201);
    const listBody = listRes.body as unknown as ListResponseBody;

    const inviteRes = await request(app.getHttpServer())
      .post(`/api/watch-lists/${listBody.id}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const inviteBody = inviteRes.body as unknown as InviteResponseBody;

    const listInvitesRes = await request(app.getHttpServer())
      .get(`/api/watch-lists/${listBody.id}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listInvitesRes.body).toEqual([
      expect.objectContaining({
        id: inviteBody.id,
        watchListId: listBody.id,
        status: 'active',
      }),
    ]);

    const revokeRes = await request(app.getHttpServer())
      .delete(`/api/watch-lists/${listBody.id}/invites/${inviteBody.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(revokeRes.body).toMatchObject({
      id: inviteBody.id,
      watchListId: listBody.id,
      status: 'revoked',
    });
  });

  it('returns friendly Spanish messages for invalid, expired, and revoked invite joins', async () => {
    const invalidJoinRes = await request(app.getHttpServer())
      .post('/api/invites/token-invalido/join')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    expect(invalidJoinRes.body).toMatchObject({
      statusCode: 404,
      message: 'Invitación no encontrada',
    });

    const listRes = await request(app.getHttpServer())
      .post('/api/watch-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lista para errores', description: 'Invites' })
      .expect(201);
    const listBody = listRes.body as unknown as ListResponseBody;

    const revokedInviteRes = await request(app.getHttpServer())
      .post(`/api/watch-lists/${listBody.id}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const revokedInviteBody =
      revokedInviteRes.body as unknown as InviteResponseBody;

    await request(app.getHttpServer())
      .delete(`/api/watch-lists/${listBody.id}/invites/${revokedInviteBody.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const revokedJoinRes = await request(app.getHttpServer())
      .post(`/api/invites/${revokedInviteBody.token}/join`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);

    expect(revokedJoinRes.body).toMatchObject({
      statusCode: 403,
      message: 'Esta invitación fue revocada',
    });

    const expiredInviteRes = await request(app.getHttpServer())
      .post(`/api/watch-lists/${listBody.id}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const expiredInviteBody =
      expiredInviteRes.body as unknown as InviteResponseBody;

    const expiredInvite = await inviteRepo.findOneByOrFail({
      id: expiredInviteBody.id,
    });
    expiredInvite.expiresAt = new Date('2020-01-01T00:00:00.000Z');
    await inviteRepo.save(expiredInvite);

    const expiredJoinRes = await request(app.getHttpServer())
      .post(`/api/invites/${expiredInviteBody.token}/join`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);

    expect(expiredJoinRes.body).toMatchObject({
      statusCode: 403,
      message: 'Esta invitación expiró',
    });
  });

  async function createListWithItem(name: string) {
    const listRes = await request(app.getHttpServer())
      .post('/api/watch-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name, description: 'Lista de prueba' })
      .expect(201);

    const providerId = Math.floor(Math.random() * 1_000_000);
    const addRes = await request(app.getHttpServer())
      .post(`/api/watch-lists/${listRes.body.id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        providerId,
        mediaType: 'movie',
        title: `Titulo ${providerId}`,
        translatedTitle: `Titulo ${providerId}`,
        releaseDate: '2024-01-01',
      })
      .expect(201);

    return {
      listId: listRes.body.id as number,
      itemId: addRes.body.items[0].id as number,
    };
  }
});
