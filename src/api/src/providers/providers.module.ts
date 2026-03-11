import { Module } from '@nestjs/common';
import { TmdbModule } from './tmdb/tmdb.module';

@Module({
  imports: [TmdbModule],
  exports: [TmdbModule],
})
export class ProvidersModule {}
