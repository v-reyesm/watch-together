import { apiFetch } from "@/lib/api";

export type ApiMediaType = "movie" | "tv";
export type ApiWatchStatus = "pending" | "watchedTogether" | "watchedAlone";

export type ApiWatchItem = {
  id: number;
  providerName: string;
  providerId: number | null;
  mediaType: ApiMediaType;
  title: string;
  translatedTitle: string;
  year: number | null;
  posterUrl: string;
  overview: string;
  originalLanguage: string;
  rating: number;
  status: ApiWatchStatus;
  watchedAt: string | null;
};

export type ApiWatchListMember = {
  id: number;
  name: string;
  email: string;
  role: "owner" | "member";
  initials: string;
};

export type ApiWatchList = {
  id: number;
  name: string;
  description: string;
  members: ApiWatchListMember[];
  itemCount: number;
  pendingCount: number;
  watchedCount: number;
  items: ApiWatchItem[];
};

export type ApiWatchSummary = {
  listCount: number;
  itemCount: number;
  watchedCount: number;
  pendingCount: number;
  lists: ApiWatchList[];
  highlightedItems: ApiWatchItem[];
};

export type ApiSearchResult = {
  id: number;
  title: string;
  translatedTitle: string;
  releaseDate: string;
  posterUrl: string;
  overview: string;
  genres: string[];
  originalLanguage: string;
  rating: number;
  mediaType: ApiMediaType;
};

export type AddListItemInput = {
  providerId: number;
  mediaType: ApiMediaType;
  title: string;
  translatedTitle?: string;
  releaseDate?: string;
  posterUrl?: string;
  overview?: string;
  originalLanguage?: string;
  rating?: number;
};

export function getWatchSummary() {
  return apiFetch<ApiWatchSummary>("/api/watch-lists/summary");
}

export function getWatchLists() {
  return apiFetch<ApiWatchList[]>("/api/watch-lists");
}

export function getWatchList(id: number) {
  return apiFetch<ApiWatchList>(`/api/watch-lists/${id}`);
}

export function addListItem(listId: number, item: AddListItemInput) {
  return apiFetch<ApiWatchList>(`/api/watch-lists/${listId}/items`, {
    method: "POST",
    body: { providerName: "tmdb", ...item },
  });
}

export function removeListItem(listId: number, itemId: number) {
  return apiFetch<ApiWatchList>(`/api/watch-lists/${listId}/items/${itemId}`, {
    method: "DELETE",
  });
}

export function markListItemWatched(listId: number, itemId: number) {
  return apiFetch<ApiWatchList>(
    `/api/watch-lists/${listId}/items/${itemId}/watch-events`,
    { method: "POST" },
  );
}

export function undoLatestWatch(listId: number, itemId: number) {
  return apiFetch<ApiWatchList>(
    `/api/watch-lists/${listId}/items/${itemId}/watch-events/latest`,
    { method: "DELETE" },
  );
}

export function searchMedia(
  query: string,
  type: ApiMediaType | "both" = "both",
) {
  const params = new URLSearchParams({ query, type });
  return apiFetch<ApiSearchResult[]>(`/api/media/search?${params.toString()}`);
}
