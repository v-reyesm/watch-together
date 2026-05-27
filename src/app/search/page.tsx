import {
  ComingSoonNote,
  PageIntro,
  sampleItems,
  SearchPanel,
  WatchItemRow,
} from "@/components/watch-ui";

export default function SearchPage() {
  return (
    <div className="container flex max-w-4xl flex-col gap-8 py-6 md:py-10">
      <PageIntro
        eyebrow="TMDB primero"
        title="Buscar y agregar"
        description="La búsqueda se ve desde el frontend, pero la consulta real debe pasar por el backend para proteger la clave de TMDB."
      />

      <SearchPanel />
      <ComingSoonNote />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Sugerencias visuales
        </h2>
        {sampleItems.slice(0, 4).map((item) => (
          <WatchItemRow key={item.id} item={item} />
        ))}
      </section>
    </div>
  );
}
