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
