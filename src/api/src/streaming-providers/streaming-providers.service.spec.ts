import { Test, TestingModule } from '@nestjs/testing';
import { StreamingProvidersService } from './streaming-providers.service';

describe('StreamingProvidersService', () => {
  let service: StreamingProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamingProvidersService],
    }).compile();

    service = module.get<StreamingProvidersService>(StreamingProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
