import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  InviteBanner,
  MetricTile,
  PageIntro,
  sampleItems,
  sampleLists,
  WatchItemRow,
  WatchListCard,
} from "@/components/watch-ui";
import { EyeIcon, ListIcon, PlusIcon } from "lucide-react";

export default function Home() {
  const watched = sampleItems.filter(
    (item) => item.status !== "pending",
  ).length;

  return (
    <div className="container flex max-w-6xl flex-col gap-8 py-6 md:py-10">
      <PageIntro
        eyebrow="Hola, tú"
        title="Mis listas"
        description="Una vista tranquila para decidir qué ver juntos, revisar pendientes y distinguir lo visto solo de lo visto en pareja."
        action={
          <Button asChild className="rounded-full">
            <Link href="/lists/new">
              <PlusIcon className="size-4" />
              Nueva lista
            </Link>
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <MetricTile
          label="Listas"
          value={String(sampleLists.length)}
          detail="listas compartidas"
          icon={ListIcon}
        />
        <MetricTile
          label="Vistas"
          value={`${watched}/${sampleItems.length}`}
          detail="títulos completados"
          icon={EyeIcon}
        />
      </section>

      <InviteBanner />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Listas compartidas
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/lists">Ver todas</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {sampleLists.map((list) => (
              <WatchListCard key={list.id} list={list} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Pendientes destacados
          </h2>
          {sampleItems.slice(0, 3).map((item) => (
            <WatchItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
