import { Test, TestingModule } from '@nestjs/testing';
import { TvSeriesService } from './tv-series.service';

describe('TvSeriesService', () => {
  let service: TvSeriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TvSeriesService],
    }).compile();

    service = module.get<TvSeriesService>(TvSeriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
