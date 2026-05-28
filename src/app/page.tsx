"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  InviteBanner,
  MetricTile,
  PageIntro,
  WatchItemRow,
  WatchListCard,
} from "@/components/watch-ui";
import { EyeIcon, ListIcon, PlusIcon } from "lucide-react";
import { getWatchSummary, markListItemWatched } from "@/lib/watch-api";
import type { ApiWatchSummary } from "@/lib/watch-api";
import { itemFromApi, listFromApi } from "@/lib/watch-mappers";

export default function Home() {
  const [summary, setSummary] = useState<ApiWatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadSummary() {
    setLoading(true);
    const { data, error: apiError } = await getWatchSummary();
    setSummary(data);
    setError(apiError ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  const lists = summary?.lists.map(listFromApi) ?? [];
  const highlightedItems = summary?.highlightedItems.map(itemFromApi) ?? [];

  async function handleMarkWatched(itemId: number | undefined) {
    const firstList = summary?.lists.find((list) =>
      list.items.some((item) => item.id === itemId),
    );
    if (!firstList || !itemId) return;
    const { data } = await markListItemWatched(firstList.id, itemId);
    if (data) {
      await loadSummary();
    }
  }

  return (
    <div className="container flex max-w-6xl flex-col gap-8 py-6 md:py-10">
      <PageIntro
        eyebrow="Hola, tú"
        title="Mis listas"
        description="Una vista tranquila para decidir qué ver juntos, revisar pendientes y distinguir lo visto solo de lo visto en pareja."
        action={
          <Button asChild className="rounded-full">
            <Link href="/lists/new">
              <PlusIcon className="size-4" />
              Nueva lista
            </Link>
          </Button>
        }
      />

      {error ? (
        <div role="alert" className="rounded-lg border bg-card p-4 text-sm">
          {error}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <MetricTile
          label="Listas"
          value={loading ? "..." : String(summary?.listCount ?? 0)}
          detail="listas compartidas"
          icon={ListIcon}
        />
        <MetricTile
          label="Vistas"
          value={
            loading
              ? "..."
              : `${summary?.watchedCount ?? 0}/${summary?.itemCount ?? 0}`
          }
          detail="títulos completados"
          icon={EyeIcon}
        />
      </section>

      <InviteBanner />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Listas compartidas
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/lists">Ver todas</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {lists.map((list) => (
              <WatchListCard key={list.id} list={list} />
            ))}
            {!loading && lists.length === 0 ? (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                Aún no tienes listas compartidas.
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Pendientes destacados
          </h2>
          {highlightedItems.slice(0, 3).map((item) => (
            <WatchItemRow
              key={item.id}
              item={item}
              onMarkWatched={() => handleMarkWatched(item.numericId)}
            />
          ))}
          {!loading && highlightedItems.length === 0 ? (
            <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              Agrega títulos desde búsqueda para ver pendientes acá.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
