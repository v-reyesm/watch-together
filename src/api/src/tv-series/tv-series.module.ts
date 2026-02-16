import { Module } from '@nestjs/common';
import { TvSeriesService } from './tv-series.service';
import { TvSeriesController } from './tv-series.controller';

@Module({
  controllers: [TvSeriesController],
  providers: [TvSeriesService],
})
export class TvSeriesModule {}
