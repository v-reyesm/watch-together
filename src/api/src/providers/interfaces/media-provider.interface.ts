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

export interface MediaProvider {
  search(
    query: string,
    page?: number,
    searchType?: MediaSearchType,
  ): Promise<MediaSearchResult[]>;
  getDetails(id: number): Promise<MediaSearchResult | null>;
}
