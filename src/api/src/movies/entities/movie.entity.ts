import { Column, Entity } from 'typeorm';
import { Media } from '../../media/entities/media.entity';

@Entity({ name: 'movies' })
export class Movie extends Media {
  @Column({ nullable: true })
  director?: string;

  @Column({ nullable: true })
  runtimeInMinutes?: number;
}
