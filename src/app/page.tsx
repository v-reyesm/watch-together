"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MetricStrip,
  PageIntro,
  SuggestionCard,
  WatchItemRow,
  WatchListCard,
} from "@/components/watch-ui";
import {
  CopyIcon,
  EyeIcon,
  LinkIcon,
  ListIcon,
  MailIcon,
  PlusIcon,
  ShuffleIcon,
  SparklesIcon,
} from "lucide-react";
import { createInvite, getWatchSummary, markListItemWatched } from "@/lib/watch-api";
import type { ApiWatchSuggestion, ApiWatchSummary } from "@/lib/watch-api";
import { useAuth } from "@/lib/auth";
import {
  buildInviteMailtoHref,
  buildInviteUrl,
  copyInviteText,
} from "@/lib/invite-links";
import { itemFromApi, listFromApi } from "@/lib/watch-mappers";

export default function Home() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ApiWatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola, ${firstName}` : "Hola";

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

  // Random "to watch" suggestions drawn from every pending item across all the
  // user's lists, each tagged with the list it belongs to. Reshuffled whenever
  // the summary reloads or the user hits "Cambiar".
  const suggestions = useMemo(() => {
    if (!summary) return [];
    // Source from the full pending set (every list, no 4-item preview cap) so
    // titles deep in a list can still surface here.
    //
    // A title that lives in several lists shows up once per list in
    // `pendingSuggestions`, so dedupe BEFORE shuffling/slicing — that way each
    // distinct title appears at most once and has equal odds of being picked.
    // `providerId`+`mediaType` is the stable cross-list identity of a title (the
    // per-list-item `id` is not stable across lists). Fall back to
    // title+year+mediaType for legacy items without a provider id so genuinely
    // distinct titles — and a movie vs. a TV entry sharing a name — never
    // collapse together. First occurrence wins, keeping its list label + link.
    const dedupedSuggestions = Array.from(
      (summary.pendingSuggestions ?? [])
        .reduce((byTitle, suggestion) => {
          const dedupeKey =
            suggestion.providerId != null
              ? `provider:${suggestion.providerId}:${suggestion.mediaType}`
              : `title:${suggestion.title}:${suggestion.year ?? ""}:${suggestion.mediaType}`;
          if (!byTitle.has(dedupeKey)) byTitle.set(dedupeKey, suggestion);
          return byTitle;
        }, new Map<string, ApiWatchSuggestion>())
        .values(),
    );

    const pending = dedupedSuggestions.map((suggestion, index) => ({
      key: `${suggestion.listId}-${suggestion.id}`,
      item: itemFromApi(suggestion, index),
      listName: suggestion.listName,
      listId: suggestion.listId,
    }));

    for (let i = pending.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pending[i], pending[j]] = [pending[j], pending[i]];
    }

    return pending.slice(0, 4);
    // shuffleSeed intentionally re-triggers the randomized selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, shuffleSeed]);
  const ownerList =
    user == null
      ? null
      : summary?.lists.find((list) =>
          list.members.some(
            (member) => member.id === user.id && member.role === "owner",
          ),
        ) ?? null;

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

  async function handleCreateInvite() {
    if (!ownerList) return;

    setCreatingInvite(true);
    setInviteMessage(null);
    const { data, error: apiError } = await createInvite(ownerList.id);
    setCreatingInvite(false);

    if (!data) {
      setError(apiError ?? "No pudimos crear la invitación.");
      return;
    }

    const nextInviteUrl = buildInviteUrl(data.token);
    setInviteUrl(nextInviteUrl);
    setError(null);
    const copied = await copyInviteText(nextInviteUrl);
    if (copied) {
      setInviteMessage("Invitación creada y enlace copiado.");
      return;
    }

    setInviteMessage("Invitación creada. Copia el enlace o compártelo por email.");
  }

  async function handleCopyInviteUrl() {
    if (!inviteUrl) return;

    const copied = await copyInviteText(inviteUrl);
    setInviteMessage(
      copied
        ? "Enlace copiado."
        : "No pudimos copiar el enlace. Copia la URL o compártela por email.",
    );
  }

  return (
    <div className="container flex max-w-6xl flex-col gap-8 py-6 md:py-10">
      <PageIntro
        eyebrow={greeting}
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

      <MetricStrip
        stats={[
          {
            label: "Listas",
            value: loading ? "..." : String(summary?.listCount ?? 0),
            detail: "compartidas",
            icon: ListIcon,
          },
          {
            label: "Vistas",
            value: loading
              ? "..."
              : `${summary?.watchedCount ?? 0}/${summary?.itemCount ?? 0}`,
            detail: "completadas",
            icon: EyeIcon,
          },
        ]}
      />

      <section className="flex flex-col gap-3 rounded-lg border border-dashed bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <LinkIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Invita a tu persona</p>
            <p className="text-xs text-muted-foreground">
              {ownerList
                ? `Crea un enlace para compartir "${ownerList.name}" por link o email.`
                : "Necesitas ser owner de una lista para crear invitaciones."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleCreateInvite}
            disabled={!ownerList || creatingInvite}
          >
            <LinkIcon className="size-4" />
            {creatingInvite ? "Creando..." : "Crear invitación"}
          </Button>
          {ownerList ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/lists?list=${ownerList.id}`}>Ver lista</Link>
            </Button>
          ) : null}
        </div>
        {inviteMessage && inviteUrl && ownerList ? (
          <div className="sm:basis-full">
            <div role="status" className="rounded-lg border bg-background p-3 text-sm">
              <p>{inviteMessage}</p>
              <a
                href={inviteUrl}
                className="mt-2 block break-all text-primary underline-offset-4 hover:underline"
              >
                {inviteUrl}
              </a>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => void handleCopyInviteUrl()}
                >
                  <CopyIcon className="size-3" />
                  Copiar
                </Button>
                <Button variant="outline" size="xs" asChild>
                  <a href={buildInviteMailtoHref(ownerList.name, inviteUrl)}>
                    <MailIcon className="size-3" />
                    Compartir por email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

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
            {loading ? (
              <>
                <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                  Cargando tus listas compartidas...
                </div>
                <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                  Preparando resumen de pendientes...
                </div>
              </>
            ) : null}
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
          {loading ? (
            <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              Cargando títulos pendientes...
            </div>
          ) : null}
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

      {!loading && suggestions.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <SparklesIcon className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Para ver
                </h2>
                <p className="text-xs text-muted-foreground">
                  Una selección al azar de tus pendientes en todas las listas.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setShuffleSeed((seed) => seed + 1)}
            >
              <ShuffleIcon className="size-4" />
              Cambiar
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.key}
                item={suggestion.item}
                listName={suggestion.listName}
                href={`/lists/${suggestion.listId}`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
