"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGridIcon, ListIcon, SearchIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, PosterGridCard, WatchItemRow } from "@/components/watch-ui";
import { AddToListButton } from "@/components/add-to-list-button";
import { MediaDetailModal } from "@/components/media-detail-modal";
import {
  addListItem,
  getMediaDetails,
  getWatchLists,
  searchMedia,
} from "@/lib/watch-api";
import type { ApiMediaDetails, ApiSearchResult, ApiWatchList } from "@/lib/watch-api";
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

  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [actorFilter, setActorFilter] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<string | null>(null);

  const [detailsCache, setDetailsCache] = useState<
    Record<string, ApiMediaDetails>
  >({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const detailsFetchedForRef = useRef("");

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
      // Pre-select the list the user came from (e.g. /search?list=<id>) when it
      // is one of their fetched lists; otherwise fall back to the first list.
      const requestedId = Number(
        new URLSearchParams(window.location.search).get("list"),
      );
      const preselected = nextLists.some((list) => list.id === requestedId)
        ? requestedId
        : (nextLists[0]?.id ?? null);
      setSelectedListId(preselected);
    });
  }, []);

  // Reset detail-dependent filters and loading state when the result set changes
  // so a new search starts clean and any in-flight fetch is treated as stale.
  useEffect(() => {
    setDetailsCache({});
    setDetailsLoading(false);
    setYearFilter(null);
    setActorFilter(null);
    setProviderFilter(null);
    detailsFetchedForRef.current = "";
  }, [results]);

  const fetchAllDetails = useCallback(async () => {
    if (results.length === 0) return;
    const key = results.map((r) => `${r.mediaType}-${r.id}`).join(",");
    if (detailsFetchedForRef.current === key) return;
    detailsFetchedForRef.current = key;
    setDetailsLoading(true);

    const entries = await Promise.allSettled(
      results.map(async (result) => {
        const itemKey = `${result.mediaType}-${result.id}`;
        const { data } = await getMediaDetails(result.id, result.mediaType);
        return { key: itemKey, data };
      }),
    );

    // Guard against stale responses: if results changed while we were
    // fetching, the [results] effect already reset the ref. Bail out so we
    // don't overwrite the cache with data from a previous search.
    if (detailsFetchedForRef.current !== key) return;

    const cache: Record<string, ApiMediaDetails> = {};
    for (const entry of entries) {
      if (entry.status === "fulfilled" && entry.value.data) {
        cache[entry.value.key] = entry.value.data;
      }
    }
    setDetailsCache(cache);
    setDetailsLoading(false);
  }, [results]);

  const yearOptions = useMemo(() => {
    const years = results.map(resultYear).filter((y): y is number => y > 0);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [results]);

  const actorOptions = useMemo(() => {
    const actors = new Set<string>();
    for (const details of Object.values(detailsCache)) {
      for (const name of details.cast) actors.add(name);
    }
    return [...actors].sort();
  }, [detailsCache]);

  const providerOptions = useMemo(() => {
    const providers = new Set<string>();
    for (const details of Object.values(detailsCache)) {
      for (const name of details.providers) providers.add(name);
    }
    return [...providers].sort();
  }, [detailsCache]);

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
      if (yearFilter && resultYear(result) !== yearFilter) return false;
      if (actorFilter) {
        const key = `${result.mediaType}-${result.id}`;
        const details = detailsCache[key];
        if (!details || !details.cast.includes(actorFilter)) return false;
      }
      if (providerFilter) {
        const key = `${result.mediaType}-${result.id}`;
        const details = detailsCache[key];
        if (!details || !details.providers.includes(providerFilter)) return false;
      }
      return true;
    });

    if (sort === "rating") {
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sort === "year") {
      filtered.sort((a, b) => resultYear(b) - resultYear(a));
    }

    return filtered;
  }, [results, typeFilter, minRating, sort, yearFilter, actorFilter, providerFilter, detailsCache]);

  return (
    <div className="container flex max-w-4xl flex-col gap-8 py-6 md:py-10">
      <PageIntro
        eyebrow="Catálogo"
        title="Buscar y agregar"
        description="La búsqueda se ve desde el frontend, pero la consulta real pasa por el backend para mantener la clave del proveedor protegida."
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
              placeholder="Buscar películas o series..."
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

            {yearOptions.length > 0 ? (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Año
                <select
                  value={yearFilter ?? ""}
                  onChange={(event) =>
                    setYearFilter(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="rounded-md border bg-background px-2 py-1 text-foreground"
                >
                  <option value="">Todos</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Actor
              <select
                value={actorFilter ?? ""}
                onChange={(event) =>
                  setActorFilter(event.target.value || null)
                }
                onFocus={fetchAllDetails}
                className="rounded-md border bg-background px-2 py-1 text-foreground"
              >
                <option value="">Todos</option>
                {detailsLoading ? (
                  <option disabled>Cargando...</option>
                ) : (
                  actorOptions.map((actor) => (
                    <option key={actor} value={actor}>
                      {actor}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Plataforma
              <select
                value={providerFilter ?? ""}
                onChange={(event) =>
                  setProviderFilter(event.target.value || null)
                }
                onFocus={fetchAllDetails}
                className="rounded-md border bg-background px-2 py-1 text-foreground"
              >
                <option value="">Todas</option>
                {detailsLoading ? (
                  <option disabled>Cargando...</option>
                ) : (
                  providerOptions.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))
                )}
              </select>
            </label>

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
            Busca una película o serie para ver resultados.
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
