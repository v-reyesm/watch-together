"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MetricTile,
  PageIntro,
  WatchItemRow,
  WatchListCard,
} from "@/components/watch-ui";
import { CopyIcon, EyeIcon, LinkIcon, ListIcon, MailIcon, PlusIcon } from "lucide-react";
import { createInvite, getWatchSummary, markListItemWatched } from "@/lib/watch-api";
import type { ApiWatchSummary } from "@/lib/watch-api";
import { useAuth } from "@/lib/auth";
import { buildInviteMailtoHref, buildInviteUrl } from "@/lib/invite-links";
import { itemFromApi, listFromApi } from "@/lib/watch-mappers";

export default function Home() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ApiWatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [creatingInvite, setCreatingInvite] = useState(false);

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

    const clipboard = navigator.clipboard?.writeText;
    if (!clipboard) {
      setInviteMessage("Invitación creada. Copia el enlace o compártelo por email.");
      return;
    }

    try {
      await clipboard.call(navigator.clipboard, nextInviteUrl);
      setInviteMessage("Invitación creada y enlace copiado.");
    } catch {
      setInviteMessage("Invitación creada. Copia el enlace o compártelo por email.");
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
                  onClick={() => navigator.clipboard?.writeText(inviteUrl)}
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
    </div>
  );
}
