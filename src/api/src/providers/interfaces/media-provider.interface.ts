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
}

export interface MediaProvider {
    search(query: string): Promise<MediaSearchResult[]>;
    getDetails(id: number): Promise<MediaSearchResult | null>;
}