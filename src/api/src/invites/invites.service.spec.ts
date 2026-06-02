import { ConflictException, ForbiddenException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Invite } from './entities/invite.entity';
import { InvitesService } from './invites.service';
import { WatchListMember } from '../watch-list/entities/watch-list-member.entity';
import { WatchList } from '../watch-list/entities/watch-list.entity';

type InviteRepoMock = Pick<
  Repository<Invite>,
  'create' | 'save' | 'findOne' | 'find' | 'findOneBy' | 'target'
>;
type WatchListRepoMock = Pick<Repository<WatchList>, 'findOneBy' | 'existsBy'>;
type MemberRepoMock = Pick<
  Repository<WatchListMember>,
  'create' | 'save' | 'findOneBy' | 'target'
>;

describe('InvitesService', () => {
  let inviteRepo: InviteRepoMock;
  let watchListRepo: WatchListRepoMock;
  let memberRepo: MemberRepoMock;
  let dataSource: Pick<DataSource, 'transaction'>;
  let service: InvitesService;

  beforeEach(() => {
    inviteRepo = {
      create: jest.fn((value: Partial<Invite>) => value as Invite),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      target: Invite,
    };
    watchListRepo = {
      findOneBy: jest.fn(),
      existsBy: jest.fn(),
    };
    memberRepo = {
      create: jest.fn(
        (value: Partial<WatchListMember>) => value as WatchListMember,
      ),
      save: jest.fn(),
      findOneBy: jest.fn(),
      target: WatchListMember,
    };
    dataSource = {
      transaction: jest.fn(),
    };

    service = new InvitesService(
      inviteRepo as Repository<Invite>,
      watchListRepo as Repository<WatchList>,
      memberRepo as Repository<WatchListMember>,
      dataSource as DataSource,
    );
  });

  it('retries token collisions when creating an invite', async () => {
    const expiresAt = new Date('2026-06-09T00:00:00.000Z');
    jest
      .spyOn(
        service as unknown as { generateToken: () => string },
        'generateToken',
      )
      .mockReturnValueOnce('first-token')
      .mockReturnValueOnce('second-token');
    jest
      .spyOn(watchListRepo, 'findOneBy')
      .mockResolvedValue({ id: 5 } as WatchList);
    jest.spyOn(memberRepo, 'findOneBy').mockResolvedValue({
      id: 1,
      userId: 7,
      watchListId: 5,
      role: 'owner',
    } as WatchListMember);
    jest
      .spyOn(inviteRepo, 'save')
      .mockRejectedValueOnce({ code: '23505' })
      .mockResolvedValueOnce({
        id: 10,
        watchListId: 5,
        createdById: 7,
        token: 'second-token',
        expiresAt,
        revokedAt: null,
        usedAt: null,
        createdAt: new Date('2026-06-02T00:00:00.000Z'),
      } as Invite);

    const result = await service.create(7, 5);

    expect(inviteRepo.save).toHaveBeenCalledTimes(2);
    expect(result.token).toBe('second-token');
  });

  it('throws after exhausting token retries', async () => {
    jest
      .spyOn(
        service as unknown as { generateToken: () => string },
        'generateToken',
      )
      .mockReturnValue('same-token');
    jest
      .spyOn(watchListRepo, 'findOneBy')
      .mockResolvedValue({ id: 5 } as WatchList);
    jest.spyOn(memberRepo, 'findOneBy').mockResolvedValue({
      id: 1,
      userId: 7,
      watchListId: 5,
      role: 'owner',
    } as WatchListMember);
    jest.spyOn(inviteRepo, 'save').mockRejectedValue({ code: '23505' });

    await expect(service.create(7, 5)).rejects.toEqual(
      new ConflictException('No pudimos crear una invitación única'),
    );
    expect(inviteRepo.save).toHaveBeenCalledTimes(5);
  });

  it('returns alreadyMember when membership insert races with another request', async () => {
    const invite = {
      id: 12,
      watchListId: 5,
      token: 'invite-token',
      expiresAt: new Date('2099-06-09T00:00:00.000Z'),
      revokedAt: null,
      usedAt: null,
      createdAt: new Date('2026-06-02T00:00:00.000Z'),
    } as Invite;
    const txInviteRepo = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const txMemberRepo = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn(
        (value: Partial<WatchListMember>) => value as WatchListMember,
      ),
      save: jest.fn().mockRejectedValue({ code: '23505' }),
    };
    const txManager = {
      getRepository: (target: unknown) => {
        if (target === inviteRepo.target) return txInviteRepo;
        if (target === memberRepo.target) return txMemberRepo;
        throw new Error('Unexpected target');
      },
    } as unknown as EntityManager;

    jest.spyOn(inviteRepo, 'findOne').mockResolvedValue(invite);
    jest.spyOn(memberRepo, 'findOneBy').mockResolvedValue(null);
    jest.spyOn(watchListRepo, 'existsBy').mockResolvedValue(true);
    jest
      .spyOn(dataSource, 'transaction')
      .mockImplementation(
        async <T>(
          runInTransaction: (entityManager: EntityManager) => Promise<T>,
        ) => runInTransaction(txManager),
      );

    const result = await service.join(9, 'invite-token');

    expect(result).toMatchObject({
      ok: true,
      alreadyMember: true,
      watchListId: 5,
      message: 'Ya eres parte de esta lista',
    });
  });

  it('still rejects revoked invites before the transaction', async () => {
    jest.spyOn(inviteRepo, 'findOne').mockResolvedValue({
      id: 12,
      watchListId: 5,
      token: 'invite-token',
      expiresAt: new Date('2099-06-09T00:00:00.000Z'),
      revokedAt: new Date('2026-06-02T00:00:00.000Z'),
      usedAt: null,
      createdAt: new Date('2026-06-02T00:00:00.000Z'),
    } as Invite);
    jest.spyOn(memberRepo, 'findOneBy').mockResolvedValue(null);

    await expect(service.join(9, 'invite-token')).rejects.toEqual(
      new ForbiddenException('Esta invitación fue revocada'),
    );
  });
});
