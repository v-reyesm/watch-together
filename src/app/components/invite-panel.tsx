"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyIcon, LinkIcon, MailIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createInvite,
  getInvites,
  revokeInvite,
  type ApiInvite,
} from "@/lib/watch-api";
import {
  buildInviteMailtoHref,
  buildInviteUrl,
  formatInviteDate,
  inviteStatusLabel,
} from "@/lib/invite-links";

type InvitePanelProps = {
  canManage: boolean;
  listId: number;
  listName: string;
  panelId?: string;
};

export function InvitePanel({
  canManage,
  listId,
  listName,
  panelId,
}: InvitePanelProps) {
  const [invites, setInvites] = useState<ApiInvite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInvites() {
      if (!canManage) {
        setInvites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error: apiError } = await getInvites(listId);
      if (cancelled) return;
      setInvites(data ?? []);
      setError(apiError ?? null);
      setLoading(false);
    }

    setMessage(null);
    void loadInvites();

    return () => {
      cancelled = true;
    };
  }, [canManage, listId]);

  const activeInvite = useMemo(
    () => invites.find((invite) => invite.status === "active") ?? null,
    [invites],
  );

  async function copyInviteLink(invite: ApiInvite, successMessage: string) {
    const inviteUrl = buildInviteUrl(invite.token);
    const clipboard = navigator.clipboard?.writeText;
    if (!clipboard) {
      setMessage("Invitación lista. Copia el enlace para compartirlo.");
      return;
    }

    try {
      await clipboard.call(navigator.clipboard, inviteUrl);
      setMessage(successMessage);
    } catch {
      setMessage("Invitación lista. Copia el enlace para compartirlo.");
    }
  }

  async function handleCreateInvite() {
    setCreating(true);
    setMessage(null);
    const { data, error: apiError } = await createInvite(listId);
    setCreating(false);

    if (!data) {
      setError(apiError ?? "No pudimos crear la invitación.");
      return;
    }

    setInvites((current) => [data, ...current.filter((invite) => invite.id !== data.id)]);
    setError(null);
    await copyInviteLink(data, "Invitación creada y enlace copiado.");
  }

  async function handleCopyInvite(invite: ApiInvite) {
    await copyInviteLink(invite, "Enlace copiado.");
  }

  async function handleRevokeInvite(inviteId: number) {
    setRevokingId(inviteId);
    const { data, error: apiError } = await revokeInvite(listId, inviteId);
    setRevokingId(null);

    if (!data) {
      setError(apiError ?? "No pudimos revocar la invitación.");
      return;
    }

    setInvites((current) =>
      current.map((invite) => (invite.id === inviteId ? data : invite)),
    );
    setError(null);
    setMessage("Invitación revocada.");
  }

  if (!canManage) {
    return null;
  }

  return (
    <section id={panelId} className="rounded-2xl border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Invitaciones pendientes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparte esta lista por enlace o por email y revoca accesos cuando ya no hagan falta.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleCreateInvite}
          disabled={creating}
        >
          <LinkIcon className="size-4" />
          {creating ? "Creando..." : "Crear invitación"}
        </Button>
      </div>

      {error ? (
        <div role="alert" className="mt-4 rounded-lg border bg-background p-3 text-sm">
          {error}
        </div>
      ) : null}

      {message ? (
        <div role="status" className="mt-4 rounded-lg border bg-background p-3 text-sm">
          <p>{message}</p>
          {activeInvite ? (
            <a
              href={buildInviteUrl(activeInvite.token)}
              className="mt-2 block break-all text-primary underline-offset-4 hover:underline"
            >
              {buildInviteUrl(activeInvite.token)}
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        {loading ? (
          <div className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            Cargando invitaciones...
          </div>
        ) : null}

        {!loading && invites.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-background p-3 text-sm text-muted-foreground">
            No hay invitaciones todavía. Crea una para compartir esta lista.
          </div>
        ) : null}

        {invites.map((invite) => {
          const inviteUrl = buildInviteUrl(invite.token);
          const canShare = invite.status === "active";

          return (
            <article key={invite.id} className="rounded-xl border bg-background p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-foreground">
                      {inviteStatusLabel(invite.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Expira {formatInviteDate(invite.expiresAt)}
                    </span>
                  </div>

                  {canShare ? (
                    <a
                      href={inviteUrl}
                      className="mt-2 block break-all text-sm text-primary underline-offset-4 hover:underline"
                    >
                      {inviteUrl}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Creada {formatInviteDate(invite.createdAt)}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {canShare ? (
                    <>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleCopyInvite(invite)}
                      >
                        <CopyIcon className="size-3" />
                        Copiar
                      </Button>
                      <Button variant="outline" size="xs" asChild>
                        <a href={buildInviteMailtoHref(listName, inviteUrl)}>
                          <MailIcon className="size-3" />
                          Email
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRevokeInvite(invite.id)}
                        disabled={revokingId === invite.id}
                      >
                        <Trash2Icon className="size-3" />
                        {revokingId === invite.id ? "Revocando..." : "Revocar"}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
