import { Test, TestingModule } from '@nestjs/testing';
import { WatchListController } from './watch-list.controller';
import { WatchListService } from './watch-list.service';

describe('WatchListController', () => {
  let controller: WatchListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchListController],
      providers: [WatchListService],
    }).compile();

    controller = module.get<WatchListController>(WatchListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
