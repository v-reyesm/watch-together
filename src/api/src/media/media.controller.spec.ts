import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
  let controller: MediaController;
  let service: { search: jest.Mock; getDetails: jest.Mock };

  beforeEach(async () => {
    service = {
      search: jest.fn(),
      getDetails: jest.fn().mockResolvedValue({
        providers: ['Netflix'],
        director: 'Jane Director',
        cast: ['Main Lead'],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDetails', () => {
    it('defaults to movie when no type is provided', async () => {
      await controller.getDetails(42);
      expect(service.getDetails).toHaveBeenCalledWith(42, 'movie');
    });

    it('passes through the tv media type', async () => {
      await controller.getDetails(42, 'tv');
      expect(service.getDetails).toHaveBeenCalledWith(42, 'tv');
    });
  });
});
