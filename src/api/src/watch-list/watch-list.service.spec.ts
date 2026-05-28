import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Media } from '../media/entities/media.entity';
import { User } from '../users/entities/user.entity';
import { WatchEvent } from './entities/watch-event.entity';
import { WatchListMember } from './entities/watch-list-member.entity';
import { WatchList } from './entities/watch-list.entity';
import { WatchListService } from './watch-list.service';

describe('WatchListService', () => {
  let service: WatchListService;
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(<T>(value: T): T => value),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchListService,
        { provide: getRepositoryToken(WatchList), useValue: repo },
        { provide: getRepositoryToken(WatchListMember), useValue: repo },
        { provide: getRepositoryToken(WatchEvent), useValue: repo },
        { provide: getRepositoryToken(Media), useValue: repo },
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<WatchListService>(WatchListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
