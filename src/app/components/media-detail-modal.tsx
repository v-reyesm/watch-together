"use client";

import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import {
  ClockIcon,
  FilmIcon,
  MonitorPlayIcon,
  StarIcon,
  TvIcon,
  UsersIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { AddToListButton } from "@/components/add-to-list-button";
import { PosterImage } from "@/components/poster-image";
import { getMediaDetails } from "@/lib/watch-api";
import type {
  ApiMediaDetails,
  ApiSearchResult,
  ApiWatchList,
} from "@/lib/watch-api";
import { formatRuntime } from "@/lib/format-runtime";

function resultYear(result: ApiSearchResult): number | null {
  if (!result.releaseDate) return null;
  const year = new Date(result.releaseDate).getUTCFullYear();
  return year && year > 1900 ? year : null;
}

export function MediaDetailModal({
  result,
  onClose,
  onAdd,
  lists,
  defaultListId,
  isAdded,
}: {
  result: ApiSearchResult | null;
  onClose: () => void;
  /** Adds `result` to the chosen list (or surfaces guidance when `null`). */
  onAdd: (result: ApiSearchResult, listId: number | null) => void;
  /** All of the user's lists, offered as targets in the picker. */
  lists: ApiWatchList[];
  /** Remembered default target for the primary one-click add. */
  defaultListId: number | null;
  /** Whether this title was already added to a given list this session. */
  isAdded: (listId: number) => boolean;
}) {
  const [details, setDetails] = useState<ApiMediaDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (!result) {
      setDetails(null);
      setDetailsLoading(false);
      return;
    }

    let active = true;
    setDetails(null);
    setDetailsLoading(true);
    getMediaDetails(result.id, result.mediaType)
      .then(({ data }) => {
        if (active) setDetails(data);
      })
      .finally(() => {
        if (active) setDetailsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [result]);

  const open = result != null;
  const TypeIcon = result?.mediaType === "tv" ? TvIcon : FilmIcon;
  const year = result ? resultYear(result) : null;
  const title = result ? result.translatedTitle || result.title : "";
  const hasPoster = Boolean(result?.posterUrl);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {result ? (
            <div className="flex max-h-[90vh] flex-col overflow-y-auto">
              {/* Hero */}
              <div className="relative isolate min-h-44 overflow-hidden bg-neutral-900 p-5 sm:p-6">
                {hasPoster ? (
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-40 blur-xl"
                    style={{ backgroundImage: `url(${result.posterUrl})` }}
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
                      <PosterImage src={result.posterUrl} alt="" />
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
                        {result.mediaType === "tv" ? "Serie" : "Película"}
                      </span>
                      {year ? (
                        <>
                          <span className="text-white/40">·</span>
                          <span>{year}</span>
                        </>
                      ) : null}
                      {result.rating ? (
                        <>
                          <span className="text-white/40">·</span>
                          <span className="inline-flex items-center gap-1">
                            <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                            {result.rating.toFixed(1)}
                          </span>
                        </>
                      ) : null}
                      {result.originalLanguage ? (
                        <>
                          <span className="text-white/40">·</span>
                          <span className="uppercase">
                            {result.originalLanguage}
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
                  <AddToListButton
                    className="w-auto"
                    lists={lists}
                    defaultListId={defaultListId}
                    isAdded={isAdded}
                    onAdd={(listId) => onAdd(result, listId)}
                  />
                </div>

                {result.overview ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {result.overview}
                  </p>
                ) : (
                  <p className="text-sm italic leading-6 text-muted-foreground">
                    Sin sinopsis disponible.
                  </p>
                )}

                {result.genres.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.genres.map((genre) => (
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
                    {result.mediaType === "movie" &&
                    details.runtimeInMinutes ? (
                      <div className="flex items-center gap-2">
                        <dt className="flex items-center gap-1.5 text-muted-foreground">
                          <ClockIcon className="size-3.5" />
                          Duración
                        </dt>
                        <dd className="font-medium text-foreground">
                          {formatRuntime(details.runtimeInMinutes)}
                        </dd>
                      </div>
                    ) : null}

                    {result.mediaType === "tv" &&
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
                          Dirección
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
  );
}
