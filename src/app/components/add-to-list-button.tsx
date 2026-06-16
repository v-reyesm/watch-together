"use client";

import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ApiWatchList } from "@/lib/watch-api";

type AddSize = "xs" | "sm" | "default";

const chevronSize: Record<AddSize, "icon-xs" | "icon-sm" | "icon"> = {
  xs: "icon-xs",
  sm: "icon-sm",
  default: "icon",
};

/**
 * Add-to-list control reused by the search result cards (grid + list views)
 * and the detail modal. Renders a split button: a primary segment that adds to
 * the remembered default list, plus a chevron segment that opens a menu with
 * all the user's lists. Picking a list from the menu adds the title there and
 * (via `onAdd`) becomes the new session default.
 *
 * - Zero lists  -> plain button that defers to the caller's guidance message.
 * - One list    -> plain "Agregar a <list>" button, no menu.
 * - Many lists  -> split button with the list picker.
 */
export function AddToListButton({
  lists,
  defaultListId,
  onAdd,
  isAdded,
  size = "default",
  className,
}: {
  lists: ApiWatchList[];
  /** Remembered default target; the primary segment adds here on click. */
  defaultListId: number | null;
  /** Called with the chosen list id (or `null` when there are no lists). */
  onAdd: (listId: number | null) => void;
  /** Whether the title was already added to a given list this session. */
  isAdded: (listId: number) => boolean;
  size?: AddSize;
  className?: string;
}) {
  const defaultList =
    lists.find((list) => list.id === defaultListId) ?? lists[0] ?? null;

  // Zero lists: keep the existing guidance flow, no pointless menu.
  if (!defaultList) {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("rounded-full", className)}
        onClick={() => onAdd(null)}
      >
        <PlusIcon />
        Agregar a lista
      </Button>
    );
  }

  const added = isAdded(defaultList.id);
  const primary = (
    <Button
      variant="outline"
      size={size}
      className={cn(
        "min-w-0",
        lists.length > 1 && "flex-1 rounded-l-full rounded-r-none border-r-0",
        lists.length <= 1 && "rounded-full",
      )}
      onClick={() => onAdd(defaultList.id)}
      disabled={added}
    >
      {added ? <CheckIcon /> : <PlusIcon />}
      <span className="truncate">
        {added ? "Agregada" : `Agregar a ${defaultList.name}`}
      </span>
    </Button>
  );

  // Single list: behaves as a plain "Agregar a <list>" button.
  if (lists.length <= 1) {
    return <div className={cn("inline-flex w-full", className)}>{primary}</div>;
  }

  return (
    <div className={cn("inline-flex w-full", className)}>
      {primary}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={chevronSize[size]}
            className="rounded-l-none rounded-r-full"
            aria-label="Elegir otra lista"
          >
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 w-56">
          <DropdownMenuLabel>Agregar a</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {lists.map((list) => {
            const listAdded = isAdded(list.id);
            return (
              <DropdownMenuItem
                key={list.id}
                disabled={listAdded}
                onSelect={() => onAdd(list.id)}
              >
                <span className="truncate">{list.name}</span>
                {listAdded ? <CheckIcon className="ml-auto" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
