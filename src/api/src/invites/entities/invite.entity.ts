import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WatchList } from '../../watch-list/entities/watch-list.entity';

/** Invite link to join a watch list. WT-030, WT-031, WT-033. */
@Entity({ name: 'invites' })
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  watchListId: number;

  @ManyToOne(() => WatchList, { onDelete: 'CASCADE' })
  watchList: WatchList;

  /** User who created the invite (owner). */
  @Column()
  createdById: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  /** High-entropy token for the link. Unique. */
  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  /** When revoked; null = still active. */
  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  /** When the invite was used (user joined); null = not used yet. */
  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
