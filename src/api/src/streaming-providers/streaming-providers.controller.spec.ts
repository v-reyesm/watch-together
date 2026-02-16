import { Test, TestingModule } from '@nestjs/testing';
import { StreamingProvidersController } from './streaming-providers.controller';
import { StreamingProvidersService } from './streaming-providers.service';

describe('StreamingProvidersController', () => {
  let controller: StreamingProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamingProvidersController],
      providers: [StreamingProvidersService],
    }).compile();

    controller = module.get<StreamingProvidersController>(StreamingProvidersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
