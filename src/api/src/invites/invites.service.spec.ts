import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import { DataSource, Repository } from 'typeorm';
import { Invite } from './entities/invite.entity';
import { InvitesService } from './invites.service';
import { WatchListMember } from '../watch-list/entities/watch-list-member.entity';
import { WatchList } from '../watch-list/entities/watch-list.entity';

type MockRepo<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function createRepo<T extends ObjectLiteral>(): MockRepo<T> {
  return {
    create: jest.fn((value) => value),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    existsBy: jest.fn(),
    update: jest.fn(),
    target: jest.fn(),
  };
}

describe('InvitesService', () => {
  let inviteRepo: MockRepo<Invite>;
  let watchListRepo: MockRepo<WatchList>;
  let memberRepo: MockRepo<WatchListMember>;
  let dataSource: Pick<DataSource, 'transaction'>;
  let service: InvitesService;

  beforeEach(() => {
    inviteRepo = createRepo<Invite>();
    watchListRepo = createRepo<WatchList>();
    memberRepo = createRepo<WatchListMember>();
    dataSource = {
      transaction: jest.fn(),
    };

    service = new InvitesService(
      inviteRepo as unknown as Repository<Invite>,
      watchListRepo as unknown as Repository<WatchList>,
      memberRepo as unknown as Repository<WatchListMember>,
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
    (watchListRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 5 });
    (memberRepo.findOneBy as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 7,
      watchListId: 5,
      role: 'owner',
    });
    (inviteRepo.save as jest.Mock)
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
      });

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
    (watchListRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 5 });
    (memberRepo.findOneBy as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 7,
      watchListId: 5,
      role: 'owner',
    });
    (inviteRepo.save as jest.Mock).mockRejectedValue({ code: '23505' });

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
    };
    const txInviteRepo = {
      findOneBy: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const txMemberRepo = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn().mockRejectedValue({ code: '23505' }),
    };

    (inviteRepo.findOne as jest.Mock).mockResolvedValue(invite);
    (watchListRepo.existsBy as jest.Mock).mockResolvedValue(true);
    (dataSource.transaction as jest.Mock).mockImplementation(async (callback) =>
      callback({
        getRepository: (target: unknown) => {
          if (target === inviteRepo.target) return txInviteRepo;
          if (target === memberRepo.target) return txMemberRepo;
          throw new Error('Unexpected target');
        },
      }),
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
    (inviteRepo.findOne as jest.Mock).mockResolvedValue({
      id: 12,
      watchListId: 5,
      token: 'invite-token',
      expiresAt: new Date('2099-06-09T00:00:00.000Z'),
      revokedAt: new Date('2026-06-02T00:00:00.000Z'),
      usedAt: null,
      createdAt: new Date('2026-06-02T00:00:00.000Z'),
    });

    await expect(service.join(9, 'invite-token')).rejects.toEqual(
      new ForbiddenException('Esta invitación fue revocada'),
    );
  });
});
