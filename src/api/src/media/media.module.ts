import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ProvidersModule } from '../providers/providers.module';
import { Movie } from '../movies/entities/movie.entity';
import { TvSerie } from '../tv-series/entities/tv-serie.entity';
import { TmdbSearchCache } from './entities/tmdb-search-cache.entity';
import { Media } from './entities/media.entity';
import { WatchEvent } from '../watch-list/entities/watch-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      TvSerie,
      TmdbSearchCache,
      Media,
      WatchEvent,
    ]),
    ProvidersModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
