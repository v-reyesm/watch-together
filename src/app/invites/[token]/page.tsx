"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { joinInvite } from "@/lib/watch-api";

export default function JoinInvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [message, setMessage] = useState("Procesando invitación...");
  const [watchListId, setWatchListId] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function join() {
      const { data, error: apiError } = await joinInvite(token);
      if (cancelled) return;

      if (!data) {
        setError(true);
        setMessage(apiError ?? "No pudimos usar esta invitación.");
        setLoading(false);
        return;
      }

      setWatchListId(data.watchListId);
      setMessage(data.message);
      setLoading(false);
    }

    void join();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="container flex max-w-xl flex-col gap-5 py-10">
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            {loading ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : error ? (
              <XIcon className="size-5" />
            ) : (
              <CheckIcon className="size-5" />
            )}
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Invitación a lista
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {watchListId ? (
            <Button asChild>
              <Link href={`/lists?list=${watchListId}`}>Ver lista</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
