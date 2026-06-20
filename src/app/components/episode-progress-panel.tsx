"use client";

import { useCallback, useEffect, useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEpisodeProgress, updateEpisodeProgress } from "@/lib/watch-api";
import type { ApiMediaType } from "@/lib/watch-api";
import { formatRuntime } from "@/lib/format-runtime";

export function EpisodeProgressPanel({
  listId,
  mediaId,
  mediaType,
}: {
  listId: number;
  mediaId: number;
  mediaType: ApiMediaType;
}) {
  const [watchedEpisodes, setWatchedEpisodes] = useState(0);
  const [saving, setSaving] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null);
  const [totalSeasons, setTotalSeasons] = useState<number | null>(null);
  const [totalRuntime, setTotalRuntime] = useState<number | null>(null);

  // A single request returns both the shared progress counter and the series
  // totals (from the persisted tv_series columns), so the list page no longer
  // fires a per-card getMediaDetails TMDB call.
  useEffect(() => {
    getEpisodeProgress(listId, mediaId).then(({ data }) => {
      if (!data) return;
      setWatchedEpisodes(data.watchedEpisodes);
      setTotalEpisodes(data.numberOfEpisodes ?? null);
      setTotalSeasons(data.numberOfSeasons ?? null);
      setTotalRuntime(data.totalRuntimeInMinutes ?? null);
    });
  }, [listId, mediaId]);

  const episodeRuntime =
    totalEpisodes && totalRuntime
      ? Math.round(totalRuntime / totalEpisodes)
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
