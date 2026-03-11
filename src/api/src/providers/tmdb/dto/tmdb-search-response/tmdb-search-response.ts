export class TmdbSearchResponse<T = TmdbMovieSearchResult> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export class TmdbMovieSearchResult {
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    title: string;
    genre_ids: number[];
    vote_average?: number;
}

export class TmdbTvSearchResult {
    id: number;
    original_language: string;
    original_name: string;
    overview: string;
    poster_path: string | null;
    first_air_date: string;
    name: string;
    genre_ids: number[];
    vote_average?: number;
}

/** @deprecated Use TmdbMovieSearchResult instead */
export type TmdbSearchResult = TmdbMovieSearchResult;
