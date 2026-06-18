import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthcheckController } from './healthcheck.controller';
import { HealthController } from './health/health.controller';
import { AppDataSource } from './db/data-source';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { StreamingProvidersModule } from './streaming-providers/streaming-providers.module';
import { MoviesModule } from './movies/movies.module';
import { TvSeriesModule } from './tv-series/tv-series.module';
import { WatchListModule } from './watch-list/watch-list.module';
import { UsersModule } from './users/users.module';
import { InvitesModule } from './invites/invites.module';
import { ProvidersModule } from './providers/providers.module';
import { GenresModule } from './genres/genres.module';
import { GlobalJwtAuthGuard } from './auth/guards/global-jwt-auth.guard';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ validate: validateEnv }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60_000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 600_000,
        limit: 100,
      },
    ]),
    AuthModule,
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GlobalJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
