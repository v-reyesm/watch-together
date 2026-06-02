"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LinkIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ListTabs,
  MemberStack,
  PosterGridCard,
  SortPills,
} from "@/components/watch-ui";
import {
  createInvite,
  getWatchList,
  getWatchLists,
  markListItemWatched,
} from "@/lib/watch-api";
import type { ApiWatchList } from "@/lib/watch-api";
import { itemFromApi } from "@/lib/watch-mappers";

export default function ListsPage() {
  const searchParams = useSearchParams();
  const selectedId = Number(searchParams.get("list"));
  const [lists, setLists] = useState<ApiWatchList[]>([]);
  const [currentList, setCurrentList] = useState<ApiWatchList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadLists() {
    setLoading(true);
    const { data, error: apiError } = await getWatchLists();
    if (!data || data.length === 0) {
      setLists([]);
      setCurrentList(null);
      setError(apiError ?? null);
      setLoading(false);
      return;
    }

    setLists(data);
    const listId =
      Number.isFinite(selectedId) && selectedId > 0 ? selectedId : data[0].id;
    const { data: detail, error: detailError } = await getWatchList(listId);
    setCurrentList(detail);
    setError(detailError ?? apiError ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const items = useMemo(
    () => currentList?.items.map(itemFromApi) ?? [],
    [currentList],
  );

  async function handleMarkWatched(itemId: number | undefined) {
    if (!currentList || !itemId) return;
    const { data, error: apiError } = await markListItemWatched(
      currentList.id,
      itemId,
    );
    setError(apiError ?? null);
    if (data) {
      setCurrentList(data);
    }
  }

  async function handleCreateInvite() {
    if (!currentList) return;
    setInviteMessage(null);
    const { data, error: apiError } = await createInvite(currentList.id);
    if (!data) {
      setError(apiError ?? "No pudimos crear la invitación.");
      return;
    }

    const inviteUrl = `${window.location.origin}/invites/${data.token}`;
    await navigator.clipboard?.writeText(inviteUrl);
    setError(null);
    setInviteMessage("Invitación creada y enlace copiado.");
  }

  if (!loading && !currentList) {
    return (
      <div className="container flex max-w-3xl flex-col gap-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Listas</h1>
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          {error ?? "Aún no tienes listas compartidas."}
        </div>
      </div>
    );
  }

  const pending = currentList?.pendingCount ?? 0;
  const watched = currentList?.watchedCount ?? 0;
  const members = currentList?.members.map((member) => member.initials) ?? [];

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-background/80 px-4 py-5 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight md:text-[1.65rem]">
              {currentList?.name ?? "Cargando lista..."}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MemberStack members={members.length ? members : ["T"]} />
                {currentList?.members
                  .map((member) => member.name)
                  .join(" · ") ?? "Cargando"}
              </span>
              <span className="text-border">·</span>
              <span>{pending} pendientes</span>
              <span className="text-border">·</span>
              <span>{watched} vistas</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleCreateInvite}
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
        {inviteMessage ? (
          <div role="status" className="rounded-lg border bg-card p-3 text-sm">
            {inviteMessage}
          </div>
        ) : null}

        {lists.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {lists.map((list) => (
              <Button key={list.id} variant="outline" size="sm" asChild>
                <Link href={`/lists?list=${list.id}`}>{list.name}</Link>
              </Button>
            ))}
          </div>
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

        <section className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {items.map((item, index) => (
            <PosterGridCard
              key={item.id}
              item={item}
              rank={index + 1}
              onMarkWatched={() => handleMarkWatched(item.numericId)}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
