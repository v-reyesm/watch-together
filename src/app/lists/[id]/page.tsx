"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  LinkIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteModal } from "@/components/invite-modal";
import {
  ListTabs,
  MemberStack,
  PosterGridCard,
  SortPills,
  type WatchItem,
} from "@/components/watch-ui";
import { useListFilters } from "@/lib/use-list-filters";
import { useAuth } from "@/lib/auth";
import {
  deleteWatchList,
  getWatchList,
  leaveWatchList,
  markListItemWatched,
  removeListMember,
  undoLatestWatch,
  updateWatchList,
} from "@/lib/watch-api";
import type { ApiWatchList } from "@/lib/watch-api";
import { itemFromApi } from "@/lib/watch-mappers";

export default function ListDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listId = Number(params.id);
  const [list, setList] = useState<ApiWatchList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

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
  const { tab, setTab, sort, setSort, query, setQuery, counts, visibleItems } =
    useListFilters(items);
  const members = list?.members.map((member) => member.initials || "?") ?? [];
  const isOwner =
    list != null &&
    user != null &&
    list.members.some(
      (member) => member.id === user.id && member.role === "owner",
    );
  const isMember =
    list != null &&
    user != null &&
    list.members.some((member) => member.id === user.id);
  const canManageInvites = isOwner;

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

  function startEditing() {
    if (!list) return;
    setEditName(list.name);
    setEditDescription(list.description);
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!list) return;
    const name = editName.trim();
    if (!name) {
      setError("El nombre de la lista no puede estar vacío.");
      return;
    }
    setBusy(true);
    const { data, error: apiError } = await updateWatchList(list.id, {
      name,
      description: editDescription.trim(),
    });
    setBusy(false);
    setError(apiError ?? null);
    if (data) {
      setList(data);
      setEditing(false);
    }
  }

  async function handleDeleteList() {
    if (!list) return;
    setBusy(true);
    const { error: apiError } = await deleteWatchList(list.id);
    setBusy(false);
    if (apiError) {
      setError(apiError);
      setConfirmingDelete(false);
      return;
    }
    router.push("/lists");
  }

  async function handleRemoveMember(memberId: number) {
    if (!list) return;
    setBusy(true);
    const { data, error: apiError } = await removeListMember(
      list.id,
      memberId,
    );
    setBusy(false);
    setError(apiError ?? null);
    if (data) {
      setList(data);
    }
  }

  async function handleLeaveList() {
    if (!list) return;
    setBusy(true);
    const { error: apiError } = await leaveWatchList(list.id);
    setBusy(false);
    if (apiError) {
      setError(apiError);
      setConfirmingLeave(false);
      return;
    }
    router.push("/lists");
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
            {editing ? (
              <div className="flex max-w-md flex-col gap-2">
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  aria-label="Nombre de la lista"
                  className="h-10 rounded-md border bg-background px-3 text-lg font-semibold outline-none"
                />
                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  aria-label="Descripción de la lista"
                  rows={2}
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit} disabled={busy}>
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    disabled={busy}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <h1 className="truncate text-2xl font-semibold tracking-tight md:text-[1.65rem]">
                {list.name}
              </h1>
            )}
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
            {isOwner ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={startEditing}
                  disabled={editing || busy}
                >
                  <PencilIcon className="size-4" />
                  Editar
                </Button>
                {confirmingDelete ? (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                      onClick={handleDeleteList}
                      disabled={busy}
                    >
                      Confirmar eliminación
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={busy}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setConfirmingDelete(true)}
                    disabled={busy}
                  >
                    <Trash2Icon className="size-4" />
                    Eliminar lista
                  </Button>
                )}
              </>
            ) : null}
            {isMember && !isOwner ? (
              confirmingLeave ? (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                    onClick={handleLeaveList}
                    disabled={busy}
                  >
                    Confirmar salida
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setConfirmingLeave(false)}
                    disabled={busy}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setConfirmingLeave(true)}
                  disabled={busy}
                >
                  <LogOutIcon className="size-4" />
                  Salir de la lista
                </Button>
              )
            ) : null}
            {canManageInvites ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setInviteOpen(true)}
              >
                <LinkIcon className="size-4" />
                Invitar
              </Button>
            ) : null}
            <Button asChild size="sm" className="rounded-full">
              <Link href={`/search?list=${listId}`}>
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

        <section
          aria-label="Miembros de la lista"
          className="max-w-3xl rounded-lg border bg-card p-4"
        >
          <h2 className="text-sm font-semibold">Miembros</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {list.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {member.initials || "?"}
                  </span>
                  <span className="truncate">{member.name}</span>
                  <span className="shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                    {member.role === "owner" ? "Owner" : "Miembro"}
                  </span>
                </span>
                {isOwner && member.role !== "owner" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={busy}
                  >
                    Quitar
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-h-11 w-full max-w-xl items-center gap-3 rounded-md border bg-background px-3">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar en esta lista"
              placeholder="Buscar en esta lista..."
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <SortPills active={sort} onChange={setSort} />
        </section>

        <ListTabs active={tab} counts={counts} onChange={setTab} />

        <InviteModal
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          canManage={canManageInvites}
          listId={list.id}
          listName={list.name}
        />

        {items.length === 0 ? (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Esta lista aún no tiene títulos. Agrega uno desde búsqueda.
          </div>
        ) : visibleItems.length ? (
          <section className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {visibleItems.map((item) => (
              <PosterGridCard
                key={item.id}
                item={item}
                onMarkWatched={handleToggleWatched}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Ningún título coincide con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
