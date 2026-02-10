import { SearchIcon } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="container flex flex-col items-center gap-6 py-8 md:py-12">
      <div className="w-full max-w-xl space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Search</h1>
        <p className="text-muted-foreground">
          Find movies & series to add to your lists
        </p>
      </div>
      <div className="bg-muted/50 border-input flex w-full max-w-xl items-center gap-2 rounded-lg border px-4 py-3">
        <SearchIcon className="text-muted-foreground size-5 shrink-0" />
        <input
          type="search"
          placeholder="Search movies or series..."
          className="bg-transparent placeholder:text-muted-foreground w-full outline-none"
          disabled
        />
      </div>
      <p className="text-muted-foreground text-sm">
        Search functionality coming soon — requires API keys (TMDB / OMDB).
      </p>
    </div>
  );
}
