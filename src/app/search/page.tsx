"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { LayoutGridIcon, ListIcon, SearchIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, PosterGridCard, WatchItemRow } from "@/components/watch-ui";
import { AddToListButton } from "@/components/add-to-list-button";
import { MediaDetailModal } from "@/components/media-detail-modal";
import { addListItem, getWatchLists, searchMedia } from "@/lib/watch-api";
import type { ApiSearchResult, ApiWatchList } from "@/lib/watch-api";
import { itemFromSearchResult } from "@/lib/watch-mappers";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "grid";
type TypeFilter = "all" | "movie" | "tv";
type SortMode = "relevance" | "rating" | "year";

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "movie", label: "Películas" },
  { value: "tv", label: "Series" },
];

const ratingThresholds: { value: number; label: string }[] = [
  { value: 0, label: "Todas" },
  { value: 5, label: "5+" },
  { value: 7, label: "7+" },
  { value: 8, label: "8+" },
];

const sortModes: { value: SortMode; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "rating", label: "Mejor valoradas" },
  { value: "year", label: "Más recientes" },
];

function resultYear(result: ApiSearchResult): number {
  if (!result.releaseDate) return 0;
  const year = new Date(result.releaseDate).getUTCFullYear();
  return year && year > 1900 ? year : 0;
}

/** Subtle shimmer placeholders shown while a search is loading. */
function SearchSkeleton({ view }: { view: ViewMode }) {
  const placeholders = Array.from({ length: view === "grid" ? 8 : 5 });

  if (view === "grid") {
    return (
      <div
        role="status"
        aria-label="Cargando resultados"
        className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
      >
        {placeholders.map((_, index) => (
          <div key={index} className="flex min-w-0 flex-col gap-2">
            <div className="aspect-[2/3] animate-pulse rounded-[4px] bg-muted" />
            <div className="h-7 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div role="status" aria-label="Cargando resultados" className="flex flex-col gap-3">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[72px_1fr] gap-4 rounded-lg border bg-card p-3"
        >
          <div className="aspect-[2/3] animate-pulse rounded-[4px] bg-muted" />
          <div className="flex flex-col gap-2 py-1">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiSearchResult[]>([]);
  const [lists, setLists] = useState<ApiWatchList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>("grid");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortMode>("relevance");

  const [detail, setDetail] = useState<ApiSearchResult | null>(null);
  // Track added titles per (list, title) so the same title can still be added
  // to a different list. Keys look like `${listId}:${result.id}`.
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());

  const isAddedTo = (resultId: number) => (listId: number) =>
    addedKeys.has(`${listId}:${resultId}`);

  useEffect(() => {
    getWatchLists().then(({ data }) => {
      const nextLists = data ?? [];
      setLists(nextLists);
      setSelectedListId(nextLists[0]?.id ?? null);
    });
  }, []);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setMessage(null);
    const { data, error } = await searchMedia(query.trim());
    setResults(data ?? []);
    setMessage(error ?? null);
    setLoading(false);
  }

  async function handleAdd(result: ApiSearchResult, listId: number | null) {
    if (!listId) {
      setMessage("Crea o selecciona una lista antes de agregar títulos.");
      return;
    }
    const { error } = await addListItem(listId, {
      providerId: result.id,
      mediaType: result.mediaType,
      title: result.title,
      translatedTitle: result.translatedTitle,
      releaseDate: result.releaseDate,
      posterUrl: result.posterUrl || undefined,
      overview: result.overview,
      originalLanguage: result.originalLanguage,
      rating: result.rating,
    });
    if (!error) {
      setAddedKeys((prev) => new Set(prev).add(`${listId}:${result.id}`));
      // The explicitly chosen list sticks as the session default.
      setSelectedListId(listId);
    }
    const listName = lists.find((list) => list.id === listId)?.name;
    const title = result.translatedTitle || result.title;
    setMessage(error ?? `${title} agregada a ${listName}.`);
  }

  const visibleResults = useMemo(() => {
    const filtered = results.filter((result) => {
      if (typeFilter !== "all" && result.mediaType !== typeFilter) return false;
      if (minRating > 0 && (result.rating ?? 0) < minRating) return false;
      return true;
    });

    if (sort === "rating") {
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sort === "year") {
      filtered.sort((a, b) => resultYear(b) - resultYear(a));
    }

    return filtered;
  }, [results, typeFilter, minRating, sort]);

  return (
    <div className="container flex max-w-4xl flex-col gap-8 py-6 md:py-10">
      <PageIntro
        eyebrow="TMDB primero"
        title="Buscar y agregar"
        description="La búsqueda se ve desde el frontend, pero la consulta real pasa por el backend para proteger la clave de TMDB."
      />

      <form
        onSubmit={handleSearch}
        className="rounded-lg border bg-card p-3 shadow-[0_1px_0_rgba(24,22,20,0.04)]"
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-md border bg-background px-3">
            <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar películas o series en TMDB..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </form>

      {message ? (
        <div role="status" className="rounded-lg border bg-card p-3 text-sm">
          {message}
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Resultados</h2>
          <div className="flex items-center gap-1 self-start rounded-full border bg-card p-1 sm:self-auto">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="Ver como lista"
              aria-pressed={view === "list"}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors",
                view === "list"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              <ListIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Ver como cuadrícula"
              aria-pressed={view === "grid"}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors",
                view === "grid"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              <LayoutGridIcon className="size-4" />
            </button>
          </div>
        </div>

        {results.length ? (
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <div className="flex flex-wrap items-center gap-1">
              {typeFilters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTypeFilter(option.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    typeFilter === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <StarIcon className="size-3.5 text-muted-foreground" />
              {ratingThresholds.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMinRating(option.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    minRating === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground sm:ml-auto">
              Ordenar
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                className="rounded-md border bg-background px-2 py-1 text-foreground"
              >
                {sortModes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {loading ? <SearchSkeleton view={view} /> : null}

        {!loading && results.length && !visibleResults.length ? (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Ningún resultado coincide con los filtros seleccionados.
          </div>
        ) : null}

        {!loading && visibleResults.length ? (
          view === "grid" ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {visibleResults.map((result, index) => (
                <div
                  key={`${result.mediaType}-${result.id}`}
                  className="flex min-w-0 flex-col gap-2"
                >
                  <PosterGridCard
                    item={itemFromSearchResult(result, index)}
                    onSelect={() => setDetail(result)}
                  />
                  <AddToListButton
                    size="xs"
                    lists={lists}
                    defaultListId={selectedListId}
                    isAdded={isAddedTo(result.id)}
                    onAdd={(listId) => handleAdd(result, listId)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleResults.map((result, index) => (
                <WatchItemRow
                  key={`${result.mediaType}-${result.id}`}
                  item={itemFromSearchResult(result, index)}
                  onOpen={() => setDetail(result)}
                  actions={
                    <AddToListButton
                      size="sm"
                      className="w-auto"
                      lists={lists}
                      defaultListId={selectedListId}
                      isAdded={isAddedTo(result.id)}
                      onAdd={(listId) => handleAdd(result, listId)}
                    />
                  }
                />
              ))}
            </div>
          )
        ) : null}

        {!loading && results.length === 0 ? (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Busca una película o serie para ver resultados reales de TMDB.
          </div>
        ) : null}
      </section>

      <MediaDetailModal
        result={detail}
        onClose={() => setDetail(null)}
        onAdd={handleAdd}
        lists={lists}
        defaultListId={selectedListId}
        isAdded={detail ? isAddedTo(detail.id) : () => false}
      />
    </div>
  );
}
