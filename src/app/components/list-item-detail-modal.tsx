"use client";

import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import {
  CheckIcon,
  ClockIcon,
  FilmIcon,
  MonitorPlayIcon,
  StarIcon,
  Trash2Icon,
  TvIcon,
  UndoIcon,
  UsersIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PosterImage } from "@/components/poster-image";
import { getMediaDetails } from "@/lib/watch-api";
import type { ApiMediaDetails, ApiWatchItem } from "@/lib/watch-api";
import { formatRuntime } from "@/lib/format-runtime";

export function ListItemDetailModal({
  item,
  onClose,
  onWatchToggle,
  onRemove,
}: {
  item: ApiWatchItem | null;
  listId: number;
  onClose: () => void;
  onWatchToggle: (item: ApiWatchItem) => Promise<void>;
  onRemove: (item: ApiWatchItem) => Promise<void>;
}) {
  const [details, setDetails] = useState<ApiMediaDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  useEffect(() => {
    if (!item) {
      setDetails(null);
      setDetailsLoading(false);
      return;
    }

    if (!item.providerId) return;

    let active = true;
    setDetails(null);
    setDetailsLoading(true);
    getMediaDetails(item.providerId, item.mediaType)
      .then(({ data }) => {
        if (active) setDetails(data);
      })
      .finally(() => {
        if (active) setDetailsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [item]);

  const open = item != null;
  const isWatched = item ? item.status !== "pending" : false;
  const TypeIcon = item?.mediaType === "tv" ? TvIcon : FilmIcon;
  const title = item ? item.translatedTitle || item.title : "";
  const hasPoster = Boolean(item?.posterUrl);

  async function handleWatchToggle() {
    if (!item) return;
    setBusy(true);
    await onWatchToggle(item);
    setBusy(false);
  }

  async function handleRemove() {
    if (!item) return;
    setBusy(true);
    await onRemove(item);
    setBusy(false);
  }

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={(next) => (!next ? onClose() : null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            {item ? (
              <div className="flex max-h-[90vh] flex-col overflow-y-auto">
                {/* Hero */}
                <div className="relative isolate min-h-44 overflow-hidden bg-neutral-900 p-5 sm:p-6">
                  {hasPoster ? (
                    <div
                      aria-hidden
                      className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-40 blur-xl"
                      style={{ backgroundImage: `url(${item.posterUrl})` }}
                    />
                  ) : null}
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-card via-card/70 to-transparent"
                  />

                  <div className="flex items-end gap-4">
                    <div className="relative w-24 shrink-0 overflow-hidden rounded-md shadow-lg sm:w-28">
                      <div className="aspect-[2/3] w-full bg-neutral-800" />
                      {hasPoster ? (
                        <PosterImage src={item.posterUrl} alt="" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <TypeIcon className="size-8 text-white/40" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 pb-1">
                      <Dialog.Title className="text-balance text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl">
                        {title}
                      </Dialog.Title>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/80">
                        <span className="inline-flex items-center gap-1">
                          <TypeIcon className="size-3.5" />
                          {item.mediaType === "tv" ? "Serie" : "Pelicula"}
                        </span>
                        {item.year ? (
                          <>
                            <span className="text-white/40">·</span>
                            <span>{item.year}</span>
                          </>
                        ) : null}
                        {item.rating ? (
                          <>
                            <span className="text-white/40">·</span>
                            <span className="inline-flex items-center gap-1">
                              <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                              {item.rating.toFixed(1)}
                            </span>
                          </>
                        ) : null}
                        {item.originalLanguage ? (
                          <>
                            <span className="text-white/40">·</span>
                            <span className="uppercase">
                              {item.originalLanguage}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-5 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      className="rounded-full"
                      variant={isWatched ? "outline" : "default"}
                      disabled={busy}
                      onClick={handleWatchToggle}
                    >
                      {isWatched ? (
                        <>
                          <UndoIcon className="size-3.5" />
                          Marcar como no vista
                        </>
                      ) : (
                        <>
                          <CheckIcon className="size-3.5" />
                          Marcar como visto
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={busy}
                      onClick={() => setConfirmRemoveOpen(true)}
                    >
                      <Trash2Icon className="size-3.5" />
                      Eliminar
                    </Button>
                  </div>

                  {item.overview ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.overview}
                    </p>
                  ) : (
                    <p className="text-sm italic leading-6 text-muted-foreground">
                      Sin sinopsis disponible.
                    </p>
                  )}

                  {item.genres.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.genres.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* Streaming providers, director, cast and runtime (from TMDB). */}
                  {detailsLoading ? (
                    <div className="flex flex-col gap-3">
                      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-56 animate-pulse rounded bg-muted" />
                    </div>
                  ) : details &&
                    (details.providers.length ||
                      details.director ||
                      details.cast.length ||
                      details.runtimeInMinutes ||
                      details.numberOfSeasons) ? (
                    <dl className="flex flex-col gap-3 border-t pt-4 text-sm">
                      {item.mediaType === "movie" &&
                      details.runtimeInMinutes ? (
                        <div className="flex items-center gap-2">
                          <dt className="flex items-center gap-1.5 text-muted-foreground">
                            <ClockIcon className="size-3.5" />
                            Duracion
                          </dt>
                          <dd className="font-medium text-foreground">
                            {formatRuntime(details.runtimeInMinutes)}
                          </dd>
                        </div>
                      ) : null}

                      {item.mediaType === "tv" &&
                      (details.numberOfSeasons ||
                        details.numberOfEpisodes ||
                        details.totalRuntimeInMinutes) ? (
                        <div className="flex items-center gap-2">
                          <dt className="flex items-center gap-1.5 text-muted-foreground">
                            <TvIcon className="size-3.5" />
                            Info
                          </dt>
                          <dd className="font-medium text-foreground">
                            {[
                              details.numberOfSeasons
                                ? `${details.numberOfSeasons} temporada${details.numberOfSeasons !== 1 ? "s" : ""}`
                                : null,
                              details.numberOfEpisodes
                                ? `${details.numberOfEpisodes} episodios`
                                : null,
                              formatRuntime(details.totalRuntimeInMinutes),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </dd>
                        </div>
                      ) : null}

                      {details.providers.length ? (
                        <div className="flex flex-col gap-1.5">
                          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <MonitorPlayIcon className="size-3.5" />
                            Disponible en
                          </dt>
                          <dd className="flex flex-wrap gap-1.5">
                            {details.providers.map((provider) => (
                              <span
                                key={provider}
                                className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                              >
                                {provider}
                              </span>
                            ))}
                          </dd>
                        </div>
                      ) : null}

                      {details.director ? (
                        <div className="flex items-center gap-2">
                          <dt className="flex items-center gap-1.5 text-muted-foreground">
                            <VideoIcon className="size-3.5" />
                            Direccion
                          </dt>
                          <dd className="font-medium text-foreground">
                            {details.director}
                          </dd>
                        </div>
                      ) : null}

                      {details.cast.length ? (
                        <div className="flex items-start gap-2">
                          <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                            <UsersIcon className="size-3.5" />
                            Reparto
                          </dt>
                          <dd className="font-medium text-foreground">
                            {details.cast.join(", ")}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </div>
              </div>
            ) : null}

            <Dialog.Close
              aria-label="Cerrar"
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white/90 transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <XIcon className="size-4" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        title="Eliminar titulo de la lista"
        description={`Se eliminara "${title}" de esta lista. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleRemove}
      />
    </>
  );
}
