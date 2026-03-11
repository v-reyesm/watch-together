import { Injectable } from '@nestjs/common';
import {
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
import { catchError, firstValueFrom, map } from 'rxjs';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

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
}
