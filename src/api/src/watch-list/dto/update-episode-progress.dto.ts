import { IsInt, Min } from 'class-validator';

export class UpdateEpisodeProgressDto {
  @IsInt()
  @Min(0)
  watchedEpisodes: number;
}
