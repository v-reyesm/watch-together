"use client";

import { FormEvent, useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoonNote, PageIntro, WatchItemRow } from "@/components/watch-ui";
import { addListItem, getWatchLists, searchMedia } from "@/lib/watch-api";
import type { ApiSearchResult, ApiWatchList } from "@/lib/watch-api";
import { itemFromSearchResult } from "@/lib/watch-mappers";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiSearchResult[]>([]);
  const [lists, setLists] = useState<ApiWatchList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  async function handleAdd(result: ApiSearchResult) {
    if (!selectedListId) {
      setMessage("Crea o selecciona una lista antes de agregar títulos.");
      return;
    }
    const { error } = await addListItem(selectedListId, {
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
    setMessage(error ?? "Título agregado a la lista.");
  }

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

        {lists.length ? (
          <label className="mt-3 block text-sm text-muted-foreground">
            Agregar a{" "}
            <select
              className="ml-2 rounded-md border bg-background px-2 py-1 text-foreground"
              value={selectedListId ?? ""}
              onChange={(event) =>
                setSelectedListId(Number(event.target.value))
              }
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </form>

      <ComingSoonNote />

      {message ? (
        <div role="status" className="rounded-lg border bg-card p-3 text-sm">
          {message}
        </div>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Sugerencias visuales
        </h2>
        {(results.length ? results : []).map((result, index) => (
          <div key={`${result.mediaType}-${result.id}`} className="space-y-2">
            <WatchItemRow item={itemFromSearchResult(result, index)} />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => handleAdd(result)}
            >
              Agregar a lista
            </Button>
          </div>
        ))}
        {!loading && results.length === 0 ? (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Busca una película o serie para ver resultados reales de TMDB.
          </div>
        ) : null}
      </section>
    </div>
  );
}
