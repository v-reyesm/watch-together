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
  summary: string;
  overview: string;
  genres: string[];
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

export type ApiInviteStatus = "active" | "expired" | "revoked" | "used";

export type ApiInvite = {
  id: number;
  watchListId: number;
  token: string;
  expiresAt: string;
  revokedAt: string | null;
  usedAt: string | null;
  createdAt: string;
  status: ApiInviteStatus;
};

export type ApiJoinInviteResult = {
  ok: boolean;
  alreadyMember: boolean;
  watchListId: number;
  message: string;
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

export type CreateWatchListInput = {
  name: string;
  description?: string;
};

export function createWatchList(input: CreateWatchListInput) {
  return apiFetch<ApiWatchList>("/api/watch-lists", {
    method: "POST",
    body: input,
  });
}

export function getWatchSummary() {
  return apiFetch<ApiWatchSummary>("/api/watch-lists/summary");
}

export function getWatchLists() {
  return apiFetch<ApiWatchList[]>("/api/watch-lists");
}

export function getWatchList(id: number) {
  return apiFetch<ApiWatchList>(`/api/watch-lists/${id}`);
}

export type UpdateWatchListInput = {
  name?: string;
  description?: string;
};

export function updateWatchList(id: number, input: UpdateWatchListInput) {
  return apiFetch<ApiWatchList>(`/api/watch-lists/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteWatchList(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/watch-lists/${id}`, {
    method: "DELETE",
  });
}

export function removeListMember(listId: number, memberId: number) {
  return apiFetch<ApiWatchList>(
    `/api/watch-lists/${listId}/members/${memberId}`,
    { method: "DELETE" },
  );
}

export function leaveWatchList(listId: number) {
  return apiFetch<{ ok: boolean }>(`/api/watch-lists/${listId}/members/me`, {
    method: "DELETE",
  });
}

export function createInvite(listId: number) {
  return apiFetch<ApiInvite>(`/api/watch-lists/${listId}/invites`, {
    method: "POST",
  });
}

export function getInvites(listId: number) {
  return apiFetch<ApiInvite[]>(`/api/watch-lists/${listId}/invites`);
}

export function revokeInvite(listId: number, inviteId: number) {
  return apiFetch<ApiInvite>(
    `/api/watch-lists/${listId}/invites/${inviteId}`,
    { method: "DELETE" },
  );
}

export function joinInvite(token: string) {
  return apiFetch<ApiJoinInviteResult>(`/api/invites/${token}/join`, {
    method: "POST",
  });
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

export function markMediaWatched(mediaId: number) {
  return apiFetch<{ ok: boolean; watchEvent: { id: number; mediaId: number; watchedAt: string } }>(
    `/api/media/${mediaId}/watch-events`,
    { method: "POST" },
  );
}

export function undoMediaWatch(mediaId: number) {
  return apiFetch<{ ok: boolean }>(
    `/api/media/${mediaId}/watch-events/latest`,
    { method: "DELETE" },
  );
}

export type ApiWatchHistoryContext =
  | { type: "alone" }
  | { type: "list"; listId: number; listName: string };

export type ApiWatchHistoryItem = {
  id: number;
  mediaId: number;
  title: string;
  translatedTitle: string;
  posterUrl: string;
  mediaType: ApiMediaType;
  watchedAt: string;
  context: ApiWatchHistoryContext;
};

export type ApiWatchHistoryResponse = {
  total: number;
  limit: number;
  offset: number;
  items: ApiWatchHistoryItem[];
};

export function getWatchHistory(limit = 20, offset = 0) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<ApiWatchHistoryResponse>(
    `/api/users/me/watch-history?${params.toString()}`,
  );
}
