import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { Movie } from '../movies/entities/movie.entity';
import { TvSerie } from '../tv-series/entities/tv-serie.entity';
import { TmdbSearchCache } from './entities/tmdb-search-cache.entity';
import { TmdbService } from '../providers/tmdb/tmdb.service';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: getRepositoryToken(Movie), useValue: mockRepo },
        { provide: getRepositoryToken(TvSerie), useValue: mockRepo },
        { provide: getRepositoryToken(TmdbSearchCache), useValue: mockRepo },
        { provide: TmdbService, useValue: { search: jest.fn() } },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
