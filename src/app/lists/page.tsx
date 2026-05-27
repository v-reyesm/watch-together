import Link from "next/link";
import { LinkIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ListTabs,
  MemberStack,
  PosterGridCard,
  sampleItems,
  sampleLists,
  SortPills,
} from "@/components/watch-ui";

export default function ListsPage() {
  const currentList = sampleLists[0];
  const pending = currentList.items.filter((item) => item.status === "pending");
  const watched = currentList.items.length - pending.length;

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-background/80 px-4 py-5 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight md:text-[1.65rem]">
              {currentList.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MemberStack members={currentList.members} />
                Tú · Ana
              </span>
              <span className="text-border">·</span>
              <span>{pending.length} pendientes</span>
              <span className="text-border">·</span>
              <span>{watched} vistas</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled
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
          {sampleItems.map((item, index) => (
            <PosterGridCard key={item.id} item={item} rank={index + 1} />
          ))}
        </section>
      </div>
    </div>
  );
}
