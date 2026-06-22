export class TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  order?: number;
}

export class TmdbCrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
}

export class TmdbCreditsResponse {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export class TmdbWatchProvider {
  provider_id: number;
  provider_name: string;
  display_priority?: number;
}

export class TmdbWatchProviderRegion {
  link?: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
  ads?: TmdbWatchProvider[];
  free?: TmdbWatchProvider[];
}

export class TmdbWatchProvidersResponse {
  id: number;
  results: Record<string, TmdbWatchProviderRegion>;
}

/** Shape of the TMDB `/movie/{id}` base detail endpoint. */
export class TmdbMovieDetailResponse {
  id: number;
  runtime?: number | null;
}

/** Shape of the TMDB `/tv/{id}` base detail endpoint. */
export class TmdbTvDetailResponse {
  id: number;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  episode_run_time?: number[];
  status?: string | null;
}
