"use client";

import { useCallback, useEffect, useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getEpisodeProgress,
  getMediaDetails,
  updateEpisodeProgress,
} from "@/lib/watch-api";
import type { ApiMediaDetails, ApiMediaType } from "@/lib/watch-api";
import { formatRuntime } from "@/lib/format-runtime";

export function EpisodeProgressPanel({
  listId,
  mediaId,
  mediaType,
  tmdbId,
}: {
  listId: number;
  mediaId: number;
  mediaType: ApiMediaType;
  tmdbId: number | null;
}) {
  const [watchedEpisodes, setWatchedEpisodes] = useState(0);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState<ApiMediaDetails | null>(null);

  useEffect(() => {
    getEpisodeProgress(listId, mediaId).then(({ data }) => {
      if (data) setWatchedEpisodes(data.watchedEpisodes);
    });
  }, [listId, mediaId]);

  useEffect(() => {
    if (tmdbId == null) return;
    getMediaDetails(tmdbId, mediaType).then(({ data }) => {
      if (data) setDetails(data);
    });
  }, [tmdbId, mediaType]);

  const totalEpisodes = details?.numberOfEpisodes ?? null;
  const totalSeasons = details?.numberOfSeasons ?? null;
  const episodeRuntime =
    totalEpisodes && details?.totalRuntimeInMinutes
      ? Math.round(details.totalRuntimeInMinutes / totalEpisodes)
      : null;

  const remainingEpisodes =
    totalEpisodes != null ? Math.max(0, totalEpisodes - watchedEpisodes) : null;
  const remainingMinutes =
    remainingEpisodes != null && episodeRuntime
      ? remainingEpisodes * episodeRuntime
      : null;

  const handleChange = useCallback(
    async (delta: number) => {
      const next = Math.max(0, watchedEpisodes + delta);
      if (totalEpisodes != null && next > totalEpisodes) return;
      setWatchedEpisodes(next);
      setSaving(true);
      await updateEpisodeProgress(listId, mediaId, next);
      setSaving(false);
    },
    [listId, mediaId, watchedEpisodes, totalEpisodes],
  );

  // Only show for TV series
  if (mediaType !== "tv") return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Progreso de episodios
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Restar episodio"
            onClick={() => handleChange(-1)}
            disabled={saving || watchedEpisodes <= 0}
          >
            <MinusIcon className="size-3.5" />
          </Button>
          <span className="min-w-[4ch] text-center text-sm font-semibold tabular-nums">
            {watchedEpisodes}
            {totalEpisodes != null ? `/${totalEpisodes}` : ""}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Sumar episodio"
            onClick={() => handleChange(1)}
            disabled={
              saving ||
              (totalEpisodes != null && watchedEpisodes >= totalEpisodes)
            }
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      {(remainingEpisodes != null || totalSeasons != null) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {totalSeasons != null && (
            <span>
              {totalSeasons} temporada{totalSeasons !== 1 ? "s" : ""}
            </span>
          )}
          {remainingEpisodes != null && remainingEpisodes > 0 && (
            <span>
              {remainingEpisodes} ep. restante{remainingEpisodes !== 1 ? "s" : ""}
            </span>
          )}
          {remainingMinutes != null &&
            remainingMinutes > 0 &&
            formatRuntime(remainingMinutes) && (
              <span>~{formatRuntime(remainingMinutes)} restantes</span>
            )}
          {remainingEpisodes === 0 && (
            <span className="font-medium text-primary">Serie completada</span>
          )}
        </div>
      )}
    </div>
  );
}
