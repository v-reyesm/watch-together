import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthcheckController } from './healthcheck.controller';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, HealthcheckController, HealthController],
  providers: [AppService],
})
export class AppModule {}
