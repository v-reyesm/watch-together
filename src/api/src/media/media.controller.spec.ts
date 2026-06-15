import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
  let controller: MediaController;
  let service: { search: jest.Mock; getTopRated: jest.Mock };

  beforeEach(async () => {
    service = {
      search: jest.fn(),
      getTopRated: jest.fn(),
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

  describe('topRated', () => {
    it('defaults to 3 covers when no limit is provided', () => {
      service.getTopRated.mockReturnValue([]);
      controller.topRated();
      expect(service.getTopRated).toHaveBeenCalledWith(3);
    });

    it('parses a numeric limit from the query string', () => {
      service.getTopRated.mockReturnValue([]);
      controller.topRated('6');
      expect(service.getTopRated).toHaveBeenCalledWith(6);
    });

    it('falls back to 3 for a non-numeric limit', () => {
      service.getTopRated.mockReturnValue([]);
      controller.topRated('abc');
      expect(service.getTopRated).toHaveBeenCalledWith(3);
    });
  });
});
