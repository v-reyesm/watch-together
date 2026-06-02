import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { Invite } from './entities/invite.entity';
import { WatchListMember } from '../watch-list/entities/watch-list-member.entity';
import { WatchList } from '../watch-list/entities/watch-list.entity';

type InviteStatus = 'active' | 'expired' | 'revoked' | 'used';

@Injectable()
export class InvitesService {
  private static readonly MAX_TOKEN_RETRIES = 5;

  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepo: Repository<Invite>,
    @InjectRepository(WatchList)
    private readonly watchListRepo: Repository<WatchList>,
    @InjectRepository(WatchListMember)
    private readonly memberRepo: Repository<WatchListMember>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, watchListId: number) {
    await this.assertOwner(userId, watchListId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let invite: Invite | null = null;

    for (let attempt = 0; attempt < InvitesService.MAX_TOKEN_RETRIES; attempt += 1) {
      try {
        invite = await this.inviteRepo.save(
          this.inviteRepo.create({
            watchListId,
            createdById: userId,
            token: this.generateToken(),
            expiresAt,
            revokedAt: null,
            usedAt: null,
          }),
        );
        break;
      } catch (error) {
        if (!this.isUniqueConstraintViolation(error)) {
          throw error;
        }

        if (attempt === InvitesService.MAX_TOKEN_RETRIES - 1) {
          throw new ConflictException('No pudimos crear una invitación única');
        }
      }
    }

    if (!invite) {
      throw new ConflictException('No pudimos crear una invitación única');
    }

    return this.serialize(invite);
  }

  async findAll(userId: number, watchListId: number) {
    await this.assertOwner(userId, watchListId);

    const invites = await this.inviteRepo.find({
      where: { watchListId },
      order: { createdAt: 'DESC' },
    });

    return invites.map((invite) => this.serialize(invite));
  }

  async revoke(userId: number, watchListId: number, inviteId: number) {
    await this.assertOwner(userId, watchListId);

    const invite = await this.inviteRepo.findOneBy({
      id: inviteId,
      watchListId,
    });
    if (!invite) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (!invite.revokedAt) {
      invite.revokedAt = new Date();
      await this.inviteRepo.save(invite);
    }

    return this.serialize(invite);
  }

  async join(userId: number, token: string) {
    const invite = await this.inviteRepo.findOne({
      where: { token },
      relations: { watchList: true },
    });

    if (!invite) {
      throw new NotFoundException('Invitación no encontrada');
    }

    const existingMembership = await this.memberRepo.findOneBy({
      userId,
      watchListId: invite.watchListId,
    });

    if (existingMembership) {
      return {
        ok: true,
        alreadyMember: true,
        watchListId: invite.watchListId,
        message: 'Ya eres parte de esta lista',
      };
    }

    if (invite.revokedAt) {
      throw new ForbiddenException('Esta invitación fue revocada');
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Esta invitación expiró');
    }
    if (invite.usedAt) {
      throw new ConflictException('Esta invitación ya fue usada');
    }

    const listExists = await this.watchListRepo.existsBy({
      id: invite.watchListId,
    });
    if (!listExists) {
      throw new NotFoundException('Lista no encontrada');
    }

    const joinResult = await this.dataSource.transaction(async (manager) => {
      const inviteRepo = manager.getRepository(this.inviteRepo.target);
      const memberRepo = manager.getRepository(this.memberRepo.target);
      const existingMembership = await memberRepo.findOneBy({
        userId,
        watchListId: invite.watchListId,
      });

      if (existingMembership) {
        return {
          ok: true,
          alreadyMember: true,
          watchListId: invite.watchListId,
          message: 'Ya eres parte de esta lista',
        };
      }

      const claim = await inviteRepo.update(
        {
          id: invite.id,
          revokedAt: IsNull(),
          usedAt: IsNull(),
          expiresAt: MoreThan(new Date()),
        },
        { usedAt: new Date() },
      );

      if (claim.affected !== 1) {
        throw new ConflictException('Esta invitación ya fue usada');
      }

      try {
        await memberRepo.save(
          memberRepo.create({
            watchListId: invite.watchListId,
            userId,
            role: 'member',
          }),
        );
      } catch (error) {
        if (!this.isUniqueConstraintViolation(error)) {
          throw error;
        }

        return {
          ok: true,
          alreadyMember: true,
          watchListId: invite.watchListId,
          message: 'Ya eres parte de esta lista',
        };
      }

      return {
        ok: true,
        alreadyMember: false,
        watchListId: invite.watchListId,
        message: 'Te uniste a la lista',
      };
    });

    return joinResult;
  }

  private async assertOwner(userId: number, watchListId: number) {
    const list = await this.watchListRepo.findOneBy({ id: watchListId });
    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    const membership = await this.memberRepo.findOneBy({ userId, watchListId });
    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException(
        'Solo el owner puede gestionar invitaciones',
      );
    }
  }

  private serialize(invite: Invite) {
    return {
      id: invite.id,
      watchListId: invite.watchListId,
      token: invite.token,
      expiresAt: invite.expiresAt.toISOString(),
      revokedAt: invite.revokedAt?.toISOString() ?? null,
      usedAt: invite.usedAt?.toISOString() ?? null,
      createdAt: invite.createdAt.toISOString(),
      status: this.statusFor(invite),
    };
  }

  private statusFor(invite: Invite): InviteStatus {
    if (invite.revokedAt) return 'revoked';
    if (invite.usedAt) return 'used';
    if (invite.expiresAt.getTime() < Date.now()) return 'expired';
    return 'active';
  }

  private generateToken() {
    return randomBytes(32).toString('base64url');
  }

  private isUniqueConstraintViolation(error: unknown) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : null;

    return code === '23505' || code === 'SQLITE_CONSTRAINT_UNIQUE';
  }
}
