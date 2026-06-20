import type {
  ApiSearchResult,
  ApiTopRatedCover,
  ApiWatchItem,
  ApiWatchList,
} from "@/lib/watch-api";
import type { Poster, WatchItem, WatchList } from "@/components/watch-ui";

const posterPalette: Poster[] = [
  { bg: "#3a4655", ink: "#f0e6cf", accent: "#d9a05a" },
  { bg: "#1d1d1f", ink: "#e9e3d3", accent: "#d35427" },
  { bg: "#0d2436", ink: "#cfe4f0", accent: "#3aa0d9" },
  { bg: "#a83a3a", ink: "#f0e6cf", accent: "#1a1a1a" },
  { bg: "#f0ebe0", ink: "#1a1a1a", accent: "#a83a3a" },
];

const listColors = ["#e88aa6", "#a98ad0", "#3a8d9a", "#d9a05a"];

export function itemFromApi(item: ApiWatchItem, index = 0): WatchItem {
  const year = item.year ?? 0;
  return {
    id: String(item.id),
    numericId: item.id,
    providerId: item.providerId,
    title: item.translatedTitle || item.title,
    year,
    type: item.mediaType === "tv" ? "serie" : "pelicula",
    meta: [
      item.mediaType === "tv" ? "Serie" : "Película",
      item.rating ? `★ ${item.rating.toFixed(1)}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    rating: item.rating ?? 0,
    status: item.status,
    poster: posterPalette[index % posterPalette.length],
    posterUrl: item.posterUrl || undefined,
    votes: { me: null, partner: null },
  };
}

export function listFromApi(list: ApiWatchList, index = 0): WatchList {
  return {
    id: String(list.id),
    numericId: list.id,
    name: list.name,
    color: listColors[index % listColors.length],
    members: list.members.map((member) => member.initials || "?"),
    items: list.items.map(itemFromApi),
  };
}

export function itemFromTopRatedCover(
  item: ApiTopRatedCover,
  index = 0,
): WatchItem {
  const releaseDate = item.releaseDate ? new Date(item.releaseDate) : null;
  const year = releaseDate?.getUTCFullYear();
  return {
    id: `${item.mediaType}-${item.id}`,
    providerId: item.id,
    title: item.translatedTitle || item.title,
    year: year && year > 1900 ? year : 0,
    type: item.mediaType === "tv" ? "serie" : "pelicula",
    meta: [
      item.mediaType === "tv" ? "Serie" : "Película",
      item.rating ? `★ ${item.rating.toFixed(1)}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    rating: item.rating ?? 0,
    status: "pending",
    poster: posterPalette[index % posterPalette.length],
    posterUrl: item.posterUrl || undefined,
    votes: { me: null, partner: null },
  };
}

export function itemFromSearchResult(
  item: ApiSearchResult,
  index = 0,
): WatchItem {
  const releaseDate = item.releaseDate ? new Date(item.releaseDate) : null;
  const year = releaseDate?.getUTCFullYear();
  return {
    id: `${item.mediaType}-${item.id}`,
    providerId: item.id,
    title: item.translatedTitle || item.title,
    year: year && year > 1900 ? year : 0,
    type: item.mediaType === "tv" ? "serie" : "pelicula",
    meta: [
      item.mediaType === "tv" ? "Serie" : "Película",
      item.rating ? `★ ${item.rating.toFixed(1)}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    rating: item.rating ?? 0,
    status: "pending",
    poster: posterPalette[index % posterPalette.length],
    posterUrl: item.posterUrl || undefined,
    votes: { me: null, partner: null },
  };
}
