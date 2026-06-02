import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Invite } from './entities/invite.entity';
import { WatchListMember } from '../watch-list/entities/watch-list-member.entity';
import { WatchList } from '../watch-list/entities/watch-list.entity';

type InviteStatus = 'active' | 'expired' | 'revoked' | 'used';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepo: Repository<Invite>,
    @InjectRepository(WatchList)
    private readonly watchListRepo: Repository<WatchList>,
    @InjectRepository(WatchListMember)
    private readonly memberRepo: Repository<WatchListMember>,
  ) {}

  async create(userId: number, watchListId: number) {
    await this.assertOwner(userId, watchListId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.inviteRepo.save(
      this.inviteRepo.create({
        watchListId,
        createdById: userId,
        token: this.generateToken(),
        expiresAt,
        revokedAt: null,
        usedAt: null,
      }),
    );

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

    const invite = await this.inviteRepo.findOneBy({ id: inviteId, watchListId });
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

    const listExists = await this.watchListRepo.existsBy({ id: invite.watchListId });
    if (!listExists) {
      throw new NotFoundException('Lista no encontrada');
    }

    await this.memberRepo.save(
      this.memberRepo.create({
        watchListId: invite.watchListId,
        userId,
        role: 'member',
      }),
    );

    invite.usedAt = new Date();
    await this.inviteRepo.save(invite);

    return {
      ok: true,
      alreadyMember: false,
      watchListId: invite.watchListId,
      message: 'Te uniste a la lista',
    };
  }

  private async assertOwner(userId: number, watchListId: number) {
    const list = await this.watchListRepo.findOneBy({ id: watchListId });
    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    const membership = await this.memberRepo.findOneBy({ userId, watchListId });
    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException('Solo el owner puede gestionar invitaciones');
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
}
