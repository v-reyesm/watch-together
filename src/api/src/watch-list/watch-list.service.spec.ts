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

  it('returns only pending highlighted items in the dashboard summary', async () => {
    jest.spyOn(service, 'findAll').mockResolvedValue([
      {
        id: 1,
        name: 'Viernes',
        description: '',
        members: [],
        itemCount: 2,
        pendingCount: 1,
        watchedCount: 1,
        items: [
          {
            id: 10,
            providerName: 'tmdb',
            providerId: 100,
            mediaType: 'movie',
            title: 'Pendiente',
            translatedTitle: 'Pendiente',
            year: 2026,
            posterUrl: '',
            overview: '',
            originalLanguage: 'es',
            rating: 0,
            status: 'pending',
            watchedAt: null,
          },
          {
            id: 11,
            providerName: 'tmdb',
            providerId: 101,
            mediaType: 'movie',
            title: 'Vista',
            translatedTitle: 'Vista',
            year: 2026,
            posterUrl: '',
            overview: '',
            originalLanguage: 'es',
            rating: 0,
            status: 'watchedTogether',
            watchedAt: '2026-06-01T00:00:00.000Z',
          },
        ],
      },
    ]);

    const summary = await service.summary(1);

    expect(summary).toMatchObject({
      listCount: 1,
      itemCount: 2,
      watchedCount: 1,
      pendingCount: 1,
    });
    expect(summary.highlightedItems).toHaveLength(1);
    expect(summary.highlightedItems[0].title).toBe('Pendiente');
  });
});
