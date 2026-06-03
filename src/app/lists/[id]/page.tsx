"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon, LinkIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ListTabs,
  MemberStack,
  PosterGridCard,
  SortPills,
  type WatchItem,
} from "@/components/watch-ui";
import {
  getWatchList,
  markListItemWatched,
  undoLatestWatch,
} from "@/lib/watch-api";
import type { ApiWatchList } from "@/lib/watch-api";
import { itemFromApi } from "@/lib/watch-mappers";

export default function ListDetailPage() {
  const params = useParams<{ id: string }>();
  const listId = Number(params.id);
  const [list, setList] = useState<ApiWatchList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadList() {
    if (!Number.isFinite(listId) || listId <= 0) {
      setError("La lista solicitada no es válida.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: apiError } = await getWatchList(listId);
    setList(data);
    setError(apiError ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  const items = useMemo(() => list?.items.map(itemFromApi) ?? [], [list]);
  const members = list?.members.map((member) => member.initials || "?") ?? [];

  async function handleToggleWatched(item: WatchItem) {
    if (!list || !item.numericId) return;
    const request =
      item.status === "pending"
        ? markListItemWatched(list.id, item.numericId)
        : undoLatestWatch(list.id, item.numericId);
    const { data, error: apiError } = await request;
    setError(apiError ?? null);
    if (data) {
      setList(data);
    }
  }

  if (loading) {
    return (
      <div className="container flex max-w-3xl flex-col gap-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Cargando lista...</h1>
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          Estamos buscando los detalles de esta lista.
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="container flex max-w-3xl flex-col gap-4 py-10">
        <Button variant="outline" className="w-fit rounded-full" asChild>
          <Link href="/lists">
            <ArrowLeftIcon className="size-4" />
            Volver a listas
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Lista no disponible</h1>
        <div role="alert" className="rounded-lg border bg-card p-4 text-sm">
          {error ?? "No pudimos cargar esta lista."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-background/80 px-4 py-5 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
              <Link href="/lists">
                <ArrowLeftIcon className="size-4" />
                Listas
              </Link>
            </Button>
            <h1 className="truncate text-2xl font-semibold tracking-tight md:text-[1.65rem]">
              {list.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MemberStack members={members.length ? members : ["?"]} />
                {list.members.map((member) => member.name).join(" · ")}
              </span>
              <span className="text-border">·</span>
              <span>{list.pendingCount} pendientes</span>
              <span className="text-border">·</span>
              <span>{list.watchedCount} vistas</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled
            >
              <LinkIcon className="size-4" />
              Invitar
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/search">
                <PlusIcon className="size-4" />
                Agregar titulo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-4 py-4 md:px-8">
        {error ? (
          <div role="alert" className="rounded-lg border bg-card p-3 text-sm">
            {error}
          </div>
        ) : null}

        {list.description ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {list.description}
          </p>
        ) : null}

        <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-h-11 w-full max-w-xl items-center gap-3 rounded-md border bg-background px-3">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              disabled
              placeholder="Buscar en esta lista..."
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <SortPills />
        </section>

        <ListTabs />

        {items.length ? (
          <section className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {items.map((item, index) => (
              <PosterGridCard
                key={item.id}
                item={item}
                rank={index + 1}
                onMarkWatched={handleToggleWatched}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Esta lista aún no tiene títulos. Agrega uno desde búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
