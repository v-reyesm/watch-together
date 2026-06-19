"use client";

import { Dialog } from "radix-ui";
import { XIcon } from "lucide-react";
import { InvitePanel } from "@/components/invite-panel";

type InviteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
  listId: number;
  listName: string;
};

export function InviteModal({
  open,
  onOpenChange,
  canManage,
  listId,
  listName,
}: InviteModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <Dialog.Title className="sr-only">
            Invitaciones — {listName}
          </Dialog.Title>

          <div className="max-h-[90vh] overflow-y-auto p-1">
            <InvitePanel
              canManage={canManage}
              listId={listId}
              listName={listName}
            />
          </div>

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
