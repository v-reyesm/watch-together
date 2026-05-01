import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Media } from '../../media/entities/media.entity';
import { User } from '../../users/entities/user.entity';
import { WatchList } from './watch-list.entity';

/** Record of a user marking something as watched. WT-050: alone (no list) or in list context (together). */
@Entity({ name: 'watch_events' })
export class WatchEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  mediaId: number;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  media: Media;

  /** Optional list context: when set, event is "on a list"; when null, "watched alone". */
  @Column({ nullable: true })
  watchListId: number | null;

  @ManyToOne(() => WatchList, { onDelete: 'CASCADE', nullable: true })
  watchList: WatchList | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  watchedAt: Date;
}
