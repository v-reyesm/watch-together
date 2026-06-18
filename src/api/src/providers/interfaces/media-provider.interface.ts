export type MediaSearchType = 'movie' | 'tv';

export interface MediaSearchResult {
  id: number;
  title: string;
  translatedTitle: string;
  releaseDate: Date;
  posterUrl: string;
  overview: string;
  genres: string[];
  originalLanguage: string;
  rating: number;
  mediaType: MediaSearchType;
}

/**
 * Extra title metadata that requires per-title provider lookups
 * (TMDB credits + watch providers). Fetched lazily for a single title,
 * e.g. when the detail modal is opened, to avoid N extra calls per search.
 */
export interface MediaExtraDetails {
  /** Streaming/flatrate provider names available for the title. */
  providers: string[];
  /** Director name(s), joined when more than one. */
  director: string | null;
  /** Top billed cast member names. */
  cast: string[];
}

export interface MediaProvider {
  search(
    query: string,
    page?: number,
    searchType?: MediaSearchType,
  ): Promise<MediaSearchResult[]>;
  getDetails(id: number): Promise<MediaSearchResult | null>;
}
