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
    jest.clearAllMocks();

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

  it('returns only pending highlighted items in the dashboard summary', async () => {
    const watchedAt = new Date('2026-06-01T00:00:00.000Z');
    const items = Array.from({ length: 5 }, (_, index) => ({
      id: index + 10,
      providerName: 'tmdb',
      providerId: index + 100,
      mediaType: 'movie',
      title: index === 4 ? 'Pendiente fuera del preview' : `Vista ${index + 1}`,
      translatedTitle:
        index === 4 ? 'Pendiente fuera del preview' : `Vista ${index + 1}`,
      releaseDate: new Date('2026-01-01T00:00:00.000Z'),
      posterUrl: '',
      overview: '',
      originalLanguage: 'es',
      rating: 0,
    }));
    repo.find.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        role: 'owner',
        watchList: {
          id: 1,
          name: 'Viernes',
          description: '',
          watchListMembers: [],
          items,
          watchEvents: items.slice(0, 4).map((item) => ({
            id: item.id + 1000,
            userId: 1,
            mediaId: item.id,
            watchListId: 1,
            watchedAt,
          })),
        },
      },
    ]);

    const summary = await service.summary(1);

    expect(summary).toMatchObject({
      listCount: 1,
      itemCount: 5,
      watchedCount: 4,
      pendingCount: 1,
    });
    expect(summary.lists[0].items).toHaveLength(4);
    expect(summary.highlightedItems).toHaveLength(1);
    expect(summary.highlightedItems[0].title).toBe(
      'Pendiente fuera del preview',
    );
  });
});
