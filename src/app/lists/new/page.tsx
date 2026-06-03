"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, Loader2Icon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/watch-ui";
import { createWatchList } from "@/lib/watch-api";

export default function NewListPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Escribe un nombre para la lista.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: apiError } = await createWatchList({
      name: trimmedName,
      description: description.trim() || undefined,
    });

    setSubmitting(false);

    if (!data) {
      setError(apiError ?? "No pudimos crear la lista. Intenta de nuevo.");
      return;
    }

    router.push(`/lists?list=${data.id}`);
  }

  return (
    <div className="container flex max-w-3xl flex-col gap-8 py-6 md:py-10">
      <PageIntro
        eyebrow="Nueva lista"
        title="Crear lista compartida"
        description="Arma un espacio para guardar películas y series que quieren ver juntos."
        action={
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/lists">
              <ArrowLeftIcon className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-lg border bg-card p-4 shadow-[0_1px_0_rgba(24,22,20,0.04)] md:p-5"
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Nombre</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Noches de viernes"
            className="min-h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            disabled={submitting}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Descripción</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Películas y series para ver juntos."
            rows={4}
            className="min-h-28 resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            disabled={submitting}
          />
        </label>

        {error ? (
          <div role="alert" className="rounded-md border bg-background p-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <Link href="/lists">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
            Crear lista
          </Button>
        </div>
      </form>
    </div>
  );
}
