import { ClockIcon } from "lucide-react";
import {
  PageIntro,
  QuickDecisionPreview,
  RankingPreview,
} from "@/components/watch-ui";

export default function ComingSoonPage() {
  return (
    <div className="container flex max-w-6xl flex-col gap-8 py-6 md:py-10">
      <PageIntro
        eyebrow="Coming soon"
        title="Funciones futuras"
        description="Ideas de interacción que quedan separadas del MVP actual. No conectan con backend ni modifican datos todavía."
        action={
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm text-muted-foreground">
            <ClockIcon className="size-4" />
            Oculto en menú
          </span>
        }
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <QuickDecisionPreview />
        <RankingPreview />
      </section>
    </div>
  );
}
