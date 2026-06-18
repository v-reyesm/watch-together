import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions } from 'typeorm';
import { MediaService } from './media.service';
import { Movie } from '../movies/entities/movie.entity';
import { TvSerie } from '../tv-series/entities/tv-serie.entity';
import { TmdbSearchCache } from './entities/tmdb-search-cache.entity';
import { TmdbService } from '../providers/tmdb/tmdb.service';
import { Media } from './entities/media.entity';
import { WatchEvent } from '../watch-list/entities/watch-event.entity';

describe('MediaService', () => {
  let service: MediaService;
  let mediaRepo: {
    find: jest.Mock<Promise<Media[]>, [FindManyOptions<Media>]>;
  };

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    mediaRepo = {
      find: jest.fn<Promise<Media[]>, [FindManyOptions<Media>]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: getRepositoryToken(Movie), useValue: mockRepo },
        { provide: getRepositoryToken(TvSerie), useValue: mockRepo },
        { provide: getRepositoryToken(TmdbSearchCache), useValue: mockRepo },
        { provide: getRepositoryToken(Media), useValue: mediaRepo },
        { provide: getRepositoryToken(WatchEvent), useValue: mockRepo },
        { provide: TmdbService, useValue: { search: jest.fn() } },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTopRated', () => {
    const makeMedia = (over: Partial<Media>): Media =>
      ({
        id: 1,
        tmdbId: 100,
        title: 'A Title',
        translatedTitle: 'Un Título',
        posterUrl: 'https://img/poster.jpg',
        rating: 8.5,
        mediaType: 'movie',
        releaseDate: new Date('2023-01-01'),
        ...over,
      }) as Media;

    it('orders by rating DESC and returns a public-shaped subset', async () => {
      const pool = [makeMedia({ id: 1, tmdbId: 100 })];
      mediaRepo.find.mockResolvedValue(pool);

      const result = await service.getTopRated(3);

      const findArgs = mediaRepo.find.mock.calls[0][0];
      expect(findArgs.order).toEqual({ rating: 'DESC' });
      expect(findArgs.take).toBeGreaterThanOrEqual(3);
      expect(result).toEqual([
        {
          id: 100,
          title: 'A Title',
          translatedTitle: 'Un Título',
          posterUrl: 'https://img/poster.jpg',
          rating: 8.5,
          mediaType: 'movie',
          releaseDate: new Date('2023-01-01'),
        },
      ]);
    });

    it('skips titles without a poster and caps the result to the limit', async () => {
      const pool = [
        makeMedia({ id: 1, tmdbId: 1, posterUrl: '' }),
        makeMedia({ id: 2, tmdbId: 2, posterUrl: '   ' }),
        makeMedia({ id: 3, tmdbId: 3 }),
        makeMedia({ id: 4, tmdbId: 4 }),
        makeMedia({ id: 5, tmdbId: 5 }),
      ];
      mediaRepo.find.mockResolvedValue(pool);

      const result = await service.getTopRated(2);

      expect(result).toHaveLength(2);
      expect(result.every((m) => m.posterUrl.trim().length > 0)).toBe(true);
    });

    it('clamps the limit into the 1..12 range', async () => {
      mediaRepo.find.mockResolvedValue([]);

      await service.getTopRated(0);
      expect(await service.getTopRated(999)).toEqual([]);

      // limit 0 -> clamped to 1, pool size = max(1*8, 30) = 30
      expect(mediaRepo.find.mock.calls[0][0].take).toBe(30);
      // limit 999 -> clamped to 12, pool size = max(12*8, 30) = 96
      expect(mediaRepo.find.mock.calls[1][0].take).toBe(96);
    });

    it('falls back to the internal id when tmdbId is missing', async () => {
      mediaRepo.find.mockResolvedValue([
        makeMedia({ id: 42, tmdbId: undefined }),
      ]);

      const result = await service.getTopRated(1);

      expect(result[0].id).toBe(42);
    });
  });
});
