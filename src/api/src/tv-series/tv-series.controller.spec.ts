import { Test, TestingModule } from '@nestjs/testing';
import { TvSeriesController } from './tv-series.controller';
import { TvSeriesService } from './tv-series.service';

describe('TvSeriesController', () => {
  let controller: TvSeriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TvSeriesController],
      providers: [TvSeriesService],
    }).compile();

    controller = module.get<TvSeriesController>(TvSeriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
