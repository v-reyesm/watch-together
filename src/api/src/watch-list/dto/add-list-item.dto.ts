import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class AddListItemDto {
  @IsOptional()
  @IsIn(['tmdb'])
  providerName?: 'tmdb';

  @IsInt()
  @Min(1)
  providerId: number;

  @IsIn(['movie', 'tv'])
  mediaType: 'movie' | 'tv';

  @IsString()
  @MaxLength(250)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  translatedTitle?: string;

  @IsOptional()
  @IsString()
  releaseDate?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  posterUrl?: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  originalLanguage?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
