import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Media } from '../media/entities/media.entity';
import { User } from '../users/entities/user.entity';
import { EpisodeProgress } from './entities/episode-progress.entity';
import { WatchEvent } from './entities/watch-event.entity';
import { WatchListMember } from './entities/watch-list-member.entity';
import { WatchList } from './entities/watch-list.entity';
import { WatchListService } from './watch-list.service';

function makeMockRepo() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(<T>(value: T): T => value),
    remove: jest.fn(),
  };
}

describe('WatchListService', () => {
  let service: WatchListService;
  const repo = makeMockRepo();
  const episodeProgressRepo = makeMockRepo();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchListService,
        { provide: getRepositoryToken(WatchList), useValue: repo },
        { provide: getRepositoryToken(WatchListMember), useValue: repo },
        { provide: getRepositoryToken(WatchEvent), useValue: repo },
        { provide: getRepositoryToken(Media), useValue: repo },
        {
          provide: getRepositoryToken(EpisodeProgress),
          useValue: episodeProgressRepo,
        },
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

    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        order: {
          id: 'ASC',
          watchList: {
            items: { id: 'ASC' },
            watchEvents: { watchedAt: 'DESC' },
          },
        },
      }),
    );
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

  describe('getEpisodeProgress', () => {
    const authorizedList = {
      id: 1,
      watchListMembers: [{ userId: 1, role: 'owner' }],
      items: [],
      watchEvents: [],
    };

    it('returns existing progress for a list item', async () => {
      repo.findOne.mockResolvedValue(authorizedList);
      episodeProgressRepo.findOneBy.mockResolvedValue({
        watchListId: 1,
        mediaId: 10,
        watchedEpisodes: 5,
        watchedSeasons: 1,
      });

      const result = await service.getEpisodeProgress(1, 1, 10);

      expect(result).toEqual({
        watchListId: 1,
        mediaId: 10,
        watchedEpisodes: 5,
        watchedSeasons: 1,
      });
    });

    it('returns zero progress when no record exists', async () => {
      repo.findOne.mockResolvedValue(authorizedList);
      episodeProgressRepo.findOneBy.mockResolvedValue(null);

      const result = await service.getEpisodeProgress(1, 1, 10);

      expect(result).toEqual({
        watchListId: 1,
        mediaId: 10,
        watchedEpisodes: 0,
        watchedSeasons: 0,
      });
    });
  });

  describe('updateEpisodeProgress', () => {
    const authorizedList = {
      id: 1,
      watchListMembers: [{ userId: 1, role: 'owner' }],
      items: [{ id: 10, title: 'Breaking Bad' }],
      watchEvents: [],
    };

    it('creates a new progress record when none exists', async () => {
      repo.findOne.mockResolvedValue(authorizedList);
      episodeProgressRepo.findOneBy.mockResolvedValue(null);
      episodeProgressRepo.save.mockImplementation((entity: EpisodeProgress) =>
        Promise.resolve(entity),
      );

      const result = await service.updateEpisodeProgress(1, 1, 10, {
        watchedEpisodes: 3,
      });

      expect(episodeProgressRepo.create).toHaveBeenCalledWith({
        watchListId: 1,
        mediaId: 10,
        watchedEpisodes: 3,
        watchedSeasons: 0,
      });
      expect(result.watchedEpisodes).toBe(3);
    });

    it('updates an existing progress record', async () => {
      repo.findOne.mockResolvedValue(authorizedList);
      const existing = {
        id: 99,
        watchListId: 1,
        mediaId: 10,
        watchedEpisodes: 3,
        watchedSeasons: 0,
      };
      episodeProgressRepo.findOneBy.mockResolvedValue(existing);
      episodeProgressRepo.save.mockImplementation((entity: EpisodeProgress) =>
        Promise.resolve(entity),
      );

      const result = await service.updateEpisodeProgress(1, 1, 10, {
        watchedEpisodes: 7,
      });

      expect(result.watchedEpisodes).toBe(7);
      expect(existing.watchedEpisodes).toBe(7);
    });

    it('throws NotFoundException when media is not in the list', async () => {
      repo.findOne.mockResolvedValue(authorizedList);

      await expect(
        service.updateEpisodeProgress(1, 1, 999, { watchedEpisodes: 1 }),
      ).rejects.toThrow('Titulo no encontrado en esta lista');
    });
  });
});
