import { Media } from '../../media/entities/media.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'tv_series' })
export class TvSerie extends Media {
  @Column({ nullable: true })
  numberOfSeasons?: number;

  @Column({ nullable: true })
  numberOfEpisodes?: number;

  @Column({ nullable: true })
  totalRuntimeInMinutes?: number;

  @Column({ nullable: true })
  status?: 'ongoing' | 'ended' | 'upcoming' | 'cancelled' | 'unknown';
}
