import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { TvSerie } from '../tv-series/entities/tv-serie.entity';
import { TmdbSearchCache } from './entities/tmdb-search-cache.entity';
import { TmdbService } from '../providers/tmdb/tmdb.service';
import {
  MediaSearchResult,
  MediaSearchType,
} from '../providers/interfaces/media-provider.interface';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaService {
  private readonly cacheTtlDays: number;

  constructor(
    @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
    @InjectRepository(TvSerie)
    private readonly tvSerieRepo: Repository<TvSerie>,
    @InjectRepository(TmdbSearchCache)
    private readonly cacheRepo: Repository<TmdbSearchCache>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    private readonly tmdbService: TmdbService,
  ) {
    this.cacheTtlDays = parseInt(process.env.SEARCH_CACHE_TTL_DAYS ?? '30', 10);
  }

  async search(
    query: string,
    page: number,
    searchType: MediaSearchType | 'both',
  ): Promise<MediaSearchResult[]> {
    if (searchType === 'both') {
      const [movies, tv] = await Promise.all([
        this.search(query, page, 'movie'),
        this.search(query, page, 'tv'),
      ]);
      return [...movies, ...tv].sort((a, b) => b.rating - a.rating);
    }

    const normalizedQuery = query.trim().toLowerCase();

    const cached = await this.cacheRepo.findOneBy({
      query: normalizedQuery,
      page,
      searchType,
    });

    if (cached && this.isCacheValid(cached.createdAt)) {
      return this.loadFromCache(cached.mediaIds, searchType);
    }

    const results = await this.tmdbService.search(query, page, searchType);
    const mediaIds = await this.persistResults(results, searchType);

    await this.upsertCache(normalizedQuery, page, searchType, mediaIds);

    return results;
  }

  private isCacheValid(createdAt: Date): boolean {
    const ttlMs = this.cacheTtlDays * 24 * 60 * 60 * 1000;
    return Date.now() - createdAt.getTime() < ttlMs;
  }

  private async loadFromCache(
    mediaIds: number[],
    searchType: MediaSearchType,
  ): Promise<MediaSearchResult[]> {
    if (mediaIds.length === 0) return [];

    const entities: Media[] =
      searchType === 'tv'
        ? await this.tvSerieRepo.find({
            where: { id: In(mediaIds) },
            relations: ['genres'],
          })
        : await this.movieRepo.find({
            where: { id: In(mediaIds) },
            relations: ['genres'],
          });

    const byId = new Map<number, Media>(entities.map((e) => [e.id, e]));
    return mediaIds
      .map((id) => byId.get(id))
      .filter((e): e is Media => e != null)
      .map((e) => this.entityToSearchResult(e, searchType));
  }

  private async persistResults(
    results: MediaSearchResult[],
    searchType: MediaSearchType,
  ): Promise<number[]> {
    const mediaIds: number[] = [];

    for (const r of results) {
      const entity = await this.findOrCreate(r, searchType);
      await this.findOrCreateBaseMedia(r, searchType);
      mediaIds.push(entity.id);
    }

    return mediaIds;
  }

  private async findOrCreate(
    r: MediaSearchResult,
    searchType: MediaSearchType,
  ): Promise<Media> {
    if (searchType === 'tv') {
      return this.findOrCreateTvSerie(r);
    }
    return this.findOrCreateMovie(r);
  }

  private async findOrCreateMovie(r: MediaSearchResult): Promise<Movie> {
    const existing = await this.movieRepo.findOneBy({ tmdbId: r.id });
    if (existing) return existing;

    const movie = this.movieRepo.create({
      title: r.title,
      translatedTitle: r.translatedTitle,
      releaseDate: r.releaseDate,
      posterUrl: r.posterUrl,
      overview: r.overview,
      originalLanguage: r.originalLanguage,
      rating: r.rating,
      tmdbId: r.id,
      providerName: 'tmdb',
      providerId: r.id,
      mediaType: 'movie',
    });
    return this.movieRepo.save(movie);
  }

  private async findOrCreateTvSerie(r: MediaSearchResult): Promise<TvSerie> {
    const existing = await this.tvSerieRepo.findOneBy({ tmdbId: r.id });
    if (existing) return existing;

    const tvSerie = this.tvSerieRepo.create({
      title: r.title,
      translatedTitle: r.translatedTitle,
      releaseDate: r.releaseDate,
      posterUrl: r.posterUrl,
      overview: r.overview,
      originalLanguage: r.originalLanguage,
      rating: r.rating,
      tmdbId: r.id,
      providerName: 'tmdb',
      providerId: r.id,
      mediaType: 'tv',
    });
    return this.tvSerieRepo.save(tvSerie);
  }

  private async findOrCreateBaseMedia(
    r: MediaSearchResult,
    searchType: MediaSearchType,
  ): Promise<Media> {
    const existing = await this.mediaRepo.findOneBy({
      providerName: 'tmdb',
      providerId: r.id,
    });
    if (existing) return existing;

    const media = this.mediaRepo.create({
      title: r.title,
      translatedTitle: r.translatedTitle,
      releaseDate: r.releaseDate,
      posterUrl: r.posterUrl,
      overview: r.overview,
      originalLanguage: r.originalLanguage,
      rating: r.rating,
      tmdbId: r.id,
      providerName: 'tmdb',
      providerId: r.id,
      mediaType: searchType,
    });

    return this.mediaRepo.save(media);
  }

  private async upsertCache(
    query: string,
    page: number,
    searchType: MediaSearchType,
    mediaIds: number[],
  ): Promise<void> {
    const existing = await this.cacheRepo.findOneBy({
      query,
      page,
      searchType,
    });

    if (existing) {
      existing.mediaIds = mediaIds;
      existing.createdAt = new Date();
      await this.cacheRepo.save(existing);
    } else {
      await this.cacheRepo.save(
        this.cacheRepo.create({ query, page, searchType, mediaIds }),
      );
    }
  }

  private entityToSearchResult(
    entity: Media,
    searchType: MediaSearchType,
  ): MediaSearchResult {
    const genreNames = (entity.genres ?? []).map((g) => g.name);
    return {
      id: entity.tmdbId ?? entity.id,
      title: entity.title,
      translatedTitle: entity.translatedTitle,
      releaseDate: entity.releaseDate,
      posterUrl: entity.posterUrl,
      overview: entity.overview,
      genres: genreNames,
      originalLanguage: entity.originalLanguage ?? '',
      rating: entity.rating ?? 0,
      mediaType: searchType,
    };
  }
}
