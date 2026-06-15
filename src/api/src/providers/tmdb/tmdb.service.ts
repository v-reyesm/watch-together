import { Injectable } from '@nestjs/common';
import {
  MediaExtraDetails,
  MediaProvider,
  MediaSearchResult,
  MediaSearchType,
} from '../interfaces/media-provider.interface';
import { HttpService } from '@nestjs/axios';
import {
  TmdbSearchResponse,
  TmdbMovieSearchResult,
  TmdbTvSearchResult,
} from './dto/tmdb-search-response/tmdb-search-response';
import {
  TmdbCreditsResponse,
  TmdbWatchProvidersResponse,
  TmdbWatchProviderRegion,
} from './dto/tmdb-details-response/tmdb-details-response';
import { catchError, firstValueFrom, map, of } from 'rxjs';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const MAX_CAST = 5;

@Injectable()
export class TmdbService implements MediaProvider {
  constructor(private readonly httpService: HttpService) {}

  async search(
    query: string,
    page = 1,
    searchType: MediaSearchType = 'movie',
  ): Promise<MediaSearchResult[]> {
    const apiPath = searchType === 'tv' ? 'search/tv' : 'search/movie';
    const url = `${process.env.TMDB_BASE_URL}/${apiPath}`;
    const params = {
      api_key: process.env.TMDB_API_KEY,
      query,
      include_adult: true,
      language: 'en-US',
      page,
    };

    if (searchType === 'tv') {
      return this.searchTv(url, params);
    }
    return this.searchMovie(url, params);
  }

  private async searchMovie(
    url: string,
    params: Record<string, unknown>,
  ): Promise<MediaSearchResult[]> {
    return firstValueFrom(
      this.httpService
        .get<TmdbSearchResponse<TmdbMovieSearchResult>>(url, { params })
        .pipe(
          map((res) =>
            res.data.results.map((r) => this.movieToSearchResult(r)),
          ),
          catchError((error: Error) => {
            console.error('TMDB movie search error:', error?.message);
            throw new Error('Failed to search TMDB movies');
          }),
        ),
    );
  }

  private async searchTv(
    url: string,
    params: Record<string, unknown>,
  ): Promise<MediaSearchResult[]> {
    return firstValueFrom(
      this.httpService
        .get<TmdbSearchResponse<TmdbTvSearchResult>>(url, { params })
        .pipe(
          map((res) => res.data.results.map((r) => this.tvToSearchResult(r))),
          catchError((error: Error) => {
            console.error('TMDB TV search error:', error?.message);
            throw new Error('Failed to search TMDB TV shows');
          }),
        ),
    );
  }

  private movieToSearchResult(r: TmdbMovieSearchResult): MediaSearchResult {
    return {
      id: r.id,
      title: r.title,
      translatedTitle: r.title,
      releaseDate: r.release_date ? new Date(r.release_date) : new Date(0),
      posterUrl: r.poster_path ? `${TMDB_IMAGE_BASE}${r.poster_path}` : '',
      overview: r.overview ?? '',
      genres: [],
      originalLanguage: r.original_language ?? '',
      rating: r.vote_average ?? 0,
      mediaType: 'movie',
    };
  }

  private tvToSearchResult(r: TmdbTvSearchResult): MediaSearchResult {
    return {
      id: r.id,
      title: r.name,
      translatedTitle: r.name,
      releaseDate: r.first_air_date ? new Date(r.first_air_date) : new Date(0),
      posterUrl: r.poster_path ? `${TMDB_IMAGE_BASE}${r.poster_path}` : '',
      overview: r.overview ?? '',
      genres: [],
      originalLanguage: r.original_language ?? '',
      rating: r.vote_average ?? 0,
      mediaType: 'tv',
    };
  }

  getDetails(_id: number): Promise<MediaSearchResult | null> {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch extra metadata (streaming providers, director, top cast) for a
   * single title. Credits and watch providers are independent TMDB calls,
   * issued in parallel. Failures degrade gracefully to empty values so the
   * detail view still renders.
   */
  async getMediaDetails(
    mediaType: MediaSearchType,
    id: number,
  ): Promise<MediaExtraDetails> {
    const segment = mediaType === 'tv' ? 'tv' : 'movie';
    const params = {
      api_key: process.env.TMDB_API_KEY,
      language: 'en-US',
    };

    const [credits, watchProviders] = await Promise.all([
      this.fetchCredits(segment, id, params),
      this.fetchWatchProviders(segment, id, params),
    ]);

    return {
      providers: this.extractProviders(watchProviders),
      director: this.extractDirector(credits, mediaType),
      cast: this.extractCast(credits),
    };
  }

  private fetchCredits(
    segment: string,
    id: number,
    params: Record<string, unknown>,
  ): Promise<TmdbCreditsResponse | null> {
    const url = `${process.env.TMDB_BASE_URL}/${segment}/${id}/credits`;
    return firstValueFrom(
      this.httpService.get<TmdbCreditsResponse>(url, { params }).pipe(
        map((res) => res.data),
        catchError((error: Error) => {
          console.error('TMDB credits error:', error?.message);
          return of(null);
        }),
      ),
    );
  }

  private fetchWatchProviders(
    segment: string,
    id: number,
    params: Record<string, unknown>,
  ): Promise<TmdbWatchProvidersResponse | null> {
    const url = `${process.env.TMDB_BASE_URL}/${segment}/${id}/watch/providers`;
    return firstValueFrom(
      this.httpService.get<TmdbWatchProvidersResponse>(url, { params }).pipe(
        map((res) => res.data),
        catchError((error: Error) => {
          console.error('TMDB watch providers error:', error?.message);
          return of(null);
        }),
      ),
    );
  }

  private extractDirector(
    credits: TmdbCreditsResponse | null,
    mediaType: MediaSearchType,
  ): string | null {
    const crew = credits?.crew ?? [];
    // Movies credit a "Director"; TV shows usually don't, so fall back to a
    // creator-like role ("Executive Producer") when present.
    const directors = crew.filter((c) => c.job === 'Director');
    const fallback =
      mediaType === 'tv' && directors.length === 0
        ? crew.filter(
            (c) => c.job === 'Executive Producer' || c.job === 'Creator',
          )
        : [];
    const names = Array.from(
      new Set([...directors, ...fallback].map((c) => c.name).filter(Boolean)),
    );
    return names.length ? names.slice(0, 2).join(', ') : null;
  }

  private extractCast(credits: TmdbCreditsResponse | null): string[] {
    const cast = credits?.cast ?? [];
    return [...cast]
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
      .slice(0, MAX_CAST)
      .map((c) => c.name)
      .filter(Boolean);
  }

  private extractProviders(
    watchProviders: TmdbWatchProvidersResponse | null,
  ): string[] {
    const results = watchProviders?.results;
    if (!results) return [];

    const preferredRegion = process.env.TMDB_WATCH_REGION || 'US';
    // Only the configured region, then US as a sensible default. Never fall back
    // to an arbitrary country: showing "available on X" for a region the user
    // can't stream from is more misleading than showing nothing.
    const region: TmdbWatchProviderRegion | undefined =
      results[preferredRegion] ?? results['US'];

    if (!region) return [];

    // Prefer flatrate (subscription) providers; fall back to free/ads.
    const offerings = [
      ...(region.flatrate ?? []),
      ...(region.free ?? []),
      ...(region.ads ?? []),
    ];
    return Array.from(
      new Set(offerings.map((p) => p.provider_name).filter(Boolean)),
    );
  }
}
