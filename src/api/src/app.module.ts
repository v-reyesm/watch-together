import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthcheckController } from './healthcheck.controller';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from './movies/movies.module';
import { StreamingProvidersModule } from './streaming-providers/streaming-providers.module';
import { AppDataSource } from './db/data-source';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    MoviesModule,
    StreamingProvidersModule,
  ],
  controllers: [AppController, HealthcheckController, HealthController],
  providers: [AppService],
})
export class AppModule {}
