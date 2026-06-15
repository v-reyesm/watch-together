import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { TvSerie } from '../tv-series/entities/tv-serie.entity';
import { TmdbSearchCache } from './entities/tmdb-search-cache.entity';
import { TmdbService } from '../providers/tmdb/tmdb.service';
import {
  MediaSearchResult,
  MediaSearchType,
} from '../providers/interfaces/media-provider.interface';
import { Media } from './entities/media.entity';
import { WatchEvent } from '../watch-list/entities/watch-event.entity';

export interface TopRatedCover {
  id: number;
  title: string;
  translatedTitle: string;
  posterUrl: string;
  rating: number;
  mediaType: 'movie' | 'tv';
  releaseDate: Date | null;
}

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
    @InjectRepository(WatchEvent)
    private readonly watchEventRepo: Repository<WatchEvent>,
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

  // Search results expose the TMDB id (entityToSearchResult), so public
  // watch-event endpoints resolve by tmdbId first and fall back to the
  // internal id. TMDB movie and TV ids live in separate namespaces, so an
  // optional mediaType disambiguates collisions.
  private async resolveMedia(
    publicId: number,
    mediaType?: MediaSearchType,
  ): Promise<Media | null> {
    const byTmdbId = await this.mediaRepo.findOneBy(
      mediaType ? { tmdbId: publicId, mediaType } : { tmdbId: publicId },
    );
    if (byTmdbId) return byTmdbId;
    return this.mediaRepo.findOneBy({ id: publicId });
  }

  async markWatchedAlone(
    userId: number,
    mediaId: number,
    mediaType?: MediaSearchType,
  ) {
    const media = await this.resolveMedia(mediaId, mediaType);
    if (!media) {
      throw new NotFoundException('Título no encontrado');
    }

    const existing = await this.watchEventRepo.findOne({
      where: { userId, mediaId: media.id, watchListId: IsNull() },
      order: { watchedAt: 'DESC' },
    });
    if (existing) {
      return {
        ok: true,
        watchEvent: {
          id: existing.id,
          mediaId: media.id,
          watchedAt: existing.watchedAt,
        },
      };
    }

    const event = await this.watchEventRepo.save(
      this.watchEventRepo.create({
        userId,
        mediaId: media.id,
        watchListId: null,
      }),
    );

    return {
      ok: true,
      watchEvent: {
        id: event.id,
        mediaId: media.id,
        watchedAt: event.watchedAt,
      },
    };
  }

  async undoWatchAlone(
    userId: number,
    mediaId: number,
    mediaType?: MediaSearchType,
  ) {
    const media = await this.resolveMedia(mediaId, mediaType);
    if (!media) {
      throw new NotFoundException('Título no encontrado');
    }

    const latest = await this.watchEventRepo.findOne({
      where: { userId, mediaId: media.id, watchListId: IsNull() },
      order: { watchedAt: 'DESC' },
    });

    if (!latest) {
      throw new NotFoundException('No hay vista reciente para deshacer');
    }

    await this.watchEventRepo.remove(latest);
    return { ok: true };
  }

  /**
   * Returns a random subset of the best-rated titles stored in our DB.
   *
   * "Best rated" is defined by the TMDB `rating` we persist; we pull a pool of
   * the highest-rated titles (ORDER BY rating DESC) and then pick a random
   * subset from that pool, so the login view shows quality covers that still
   * vary on each visit. Titles without a poster are skipped. This is public
   * (no auth) because it powers the unauthenticated sign-in page.
   */
  async getTopRated(limit = 3): Promise<TopRatedCover[]> {
    const safeLimit = Math.min(Math.max(Math.trunc(limit) || 0, 1), 12);
    // Pull a generously sized pool of top-rated titles so the random subset
    // still feels fresh without scanning the whole table.
    const poolSize = Math.max(safeLimit * 8, 30);

    const pool = await this.mediaRepo.find({
      where: { rating: Not(IsNull()) },
      order: { rating: 'DESC' },
      take: poolSize,
    });

    const withPoster = pool.filter(
      (m) => typeof m.posterUrl === 'string' && m.posterUrl.trim().length > 0,
    );

    return this.shuffle(withPoster)
      .slice(0, safeLimit)
      .map((m) => ({
        id: m.tmdbId ?? m.id,
        title: m.title,
        translatedTitle: m.translatedTitle,
        posterUrl: m.posterUrl,
        rating: m.rating ?? 0,
        mediaType: m.mediaType,
        releaseDate: m.releaseDate ?? null,
      }));
  }

  private shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  async getWatchHistory(userId: number, limit = 20, offset = 0) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);
    const [events, total] = await this.watchEventRepo.findAndCount({
      where: { userId },
      relations: ['media', 'watchList'],
      order: { watchedAt: 'DESC' },
      take: safeLimit,
      skip: safeOffset,
    });

    return {
      total,
      limit: safeLimit,
      offset: safeOffset,
      items: events.map((e) => ({
        id: e.id,
        mediaId: e.mediaId,
        title: e.media?.title ?? '',
        translatedTitle: e.media?.translatedTitle ?? '',
        posterUrl: e.media?.posterUrl ?? '',
        mediaType: e.media?.mediaType ?? 'movie',
        watchedAt: e.watchedAt,
        context: e.watchListId
          ? {
              type: 'list' as const,
              listId: e.watchListId,
              listName: e.watchList?.name ?? '',
            }
          : { type: 'alone' as const },
      })),
    };
  }
}
