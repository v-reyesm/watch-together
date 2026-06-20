import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Media } from '../../media/entities/media.entity';
import { WatchList } from './watch-list.entity';

/**
 * Shared episode progress for a TV series within a list.
 * One row per (list, media). All list members see and update the same counter.
 */
@Entity({ name: 'episode_progress' })
@Unique(['watchListId', 'mediaId'])
export class EpisodeProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  watchListId: number;

  @ManyToOne(() => WatchList, { onDelete: 'CASCADE' })
  watchList: WatchList;

  @Column()
  mediaId: number;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  media: Media;

  @Column({ type: 'int', default: 0 })
  watchedEpisodes: number;

  @Column({ type: 'int', default: 0 })
  watchedSeasons: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
