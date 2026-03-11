import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthcheckController } from './healthcheck.controller';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from './media/media.module';
import { StreamingProvidersModule } from './streaming-providers/streaming-providers.module';
import { AppDataSource } from './db/data-source';
import { MoviesModule } from './movies/movies.module';
import { TvSeriesModule } from './tv-series/tv-series.module';
import { WatchListModule } from './watch-list/watch-list.module';
import { UsersModule } from './users/users.module';
import { InvitesModule } from './invites/invites.module';
import { ProvidersModule } from './providers/providers.module';
import { GenresModule } from './genres/genres.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    MediaModule,
    StreamingProvidersModule,
    MoviesModule,
    TvSeriesModule,
    WatchListModule,
    UsersModule,
    InvitesModule,
    ProvidersModule,
    GenresModule,
  ],
  controllers: [AppController, HealthcheckController, HealthController],
  providers: [AppService],
})
export class AppModule {}
