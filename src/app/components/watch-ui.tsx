import Link from "next/link";
import type React from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  DicesIcon,
  EyeIcon,
  FilmIcon,
  LinkIcon,
  ListIcon,
  ListPlusIcon,
  SearchIcon,
  SparklesIcon,
  TvIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PosterImage } from "@/components/poster-image";

export type Poster = {
  bg: string;
  ink: string;
  accent: string;
};

export type WatchItem = {
  id: string;
  numericId?: number;
  providerId?: number | null;
  title: string;
  year: number;
  type: "pelicula" | "serie";
  meta: string;
  rating?: number;
  status: "pending" | "watchedTogether" | "watchedAlone";
  poster: Poster;
  posterUrl?: string;
  votes: {
    me: VoteValue;
    partner: VoteValue;
  };
};

export type WatchList = {
  id: string;
  numericId?: number;
  name: string;
  color: string;
  members: string[];
  items: WatchItem[];
};

type VoteValue = "muchas" | "late" | "igual" | "paso" | null;

export const sampleItems: WatchItem[] = [
  {
    id: "past-lives",
    title: "Past Lives",
    year: 2023,
    type: "pelicula",
    meta: "Drama · 1h 45m",
    status: "pending",
    poster: { bg: "#3a4655", ink: "#f0e6cf", accent: "#d9a05a" },
    votes: { me: "muchas", partner: "muchas" },
  },
  {
    id: "the-bear",
    title: "The Bear",
    year: 2022,
    type: "serie",
    meta: "Drama · 3 temp.",
    status: "pending",
    poster: { bg: "#1d1d1f", ink: "#e9e3d3", accent: "#d35427" },
    votes: { me: "muchas", partner: "late" },
  },
  {
    id: "severance",
    title: "Severance",
    year: 2022,
    type: "serie",
    meta: "Sci-Fi · 2 temp.",
    status: "pending",
    poster: { bg: "#0d2436", ink: "#cfe4f0", accent: "#3aa0d9" },
    votes: { me: "late", partner: null },
  },
  {
    id: "fleabag",
    title: "Fleabag",
    year: 2016,
    type: "serie",
    meta: "Comedia · vista 14 abr",
    status: "watchedTogether",
    poster: { bg: "#a83a3a", ink: "#f0e6cf", accent: "#1a1a1a" },
    votes: { me: "muchas", partner: "muchas" },
  },
  {
    id: "marriage-story",
    title: "Marriage Story",
    year: 2019,
    type: "pelicula",
    meta: "Drama · vista solo",
    status: "watchedAlone",
    poster: { bg: "#f0ebe0", ink: "#1a1a1a", accent: "#a83a3a" },
    votes: { me: "muchas", partner: null },
  },
];

export const sampleLists: WatchList[] = [
  {
    id: "friday",
    name: "Noches de viernes",
    color: "#e88aa6",
    members: ["T", "A"],
    items: sampleItems,
  },
  {
    id: "short-series",
    name: "Series cortas",
    color: "#a98ad0",
    members: ["T", "A"],
    items: sampleItems.slice(1, 4),
  },
];

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-[0_1px_0_rgba(24,22,20,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-primary">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </span>
      </div>
    </div>
  );
}

export type MetricStripItem = {
  label: string;
  value: string;
  detail?: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function MetricStrip({ stats }: { stats: MetricStripItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border bg-card px-4 py-3 shadow-[0_1px_0_rgba(24,22,20,0.04)]">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-lg font-semibold leading-tight tracking-tight text-primary">
                {stat.value}
                {stat.detail ? (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {stat.detail}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SuggestionCard({
  item,
  listName,
  href,
}: {
  item: WatchItem;
  listName: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="relative block">
        <PosterBlock
          item={item}
          className="w-full transition group-hover:-translate-y-0.5"
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold tracking-tight">
          {item.title}
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <ListIcon className="size-3 shrink-0" />
          <span className="truncate">{listName}</span>
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group flex min-w-0 flex-col gap-2 text-left"
        title={`${item.title} · ${listName}`}
      >
        {content}
      </Link>
    );
  }

  return <div className="group flex min-w-0 flex-col gap-2">{content}</div>;
}

export function PosterBlock({
  item,
  className,
}: {
  item: WatchItem;
  className?: string;
}) {
  const layout = item.id.length % 4;

  return (
    <div
      className={cn(
        "relative aspect-[2/3] min-h-0 overflow-hidden rounded-[4px] shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_18px_rgba(0,0,0,0.18)]",
        className,
      )}
      style={{ backgroundColor: item.poster.bg, color: item.poster.ink }}
      aria-label={`${item.title}, ${item.year}`}
    >
      <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:3px_3px]" />
      {layout === 0 ? (
        <div
          className="absolute left-0 right-0 top-[46%] h-0.5"
          style={{ backgroundColor: item.poster.accent }}
        />
      ) : null}
      {layout === 1 ? (
        <div
          className="absolute left-3 right-3 top-3 bottom-3 rounded-[3px] border"
          style={{ borderColor: item.poster.accent }}
        />
      ) : null}
      {layout === 2 ? (
        <div
          className="absolute left-1/2 top-[30%] size-10 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: item.poster.accent }}
        />
      ) : null}
      {layout === 3 ? (
        <div className="absolute inset-x-0 top-4 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="h-px opacity-20"
              style={{ backgroundColor: item.poster.ink }}
            />
          ))}
        </div>
      ) : null}
      <div className="absolute left-3 right-3 top-3 font-mono text-[0.58rem] uppercase tracking-[0.14em] opacity-75">
        {item.type === "serie" ? "Serie" : "Película"} · {item.year}
      </div>
      <div className="absolute bottom-3 left-3 right-3 text-balance text-base font-semibold leading-none tracking-tight">
        {item.title}
      </div>
      {item.posterUrl ? (
        <PosterImage key={item.posterUrl} src={item.posterUrl} alt="" />
      ) : null}
    </div>
  );
}

export function StatusChip({ status }: { status: WatchItem["status"] }) {
  if (status === "watchedTogether") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
        <CheckIcon className="size-3" />
        Vista juntos
      </span>
    );
  }

  if (status === "watchedAlone") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <EyeIcon className="size-3" />
        Vista solo
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <ClockIcon className="size-3" />
      Pendiente
    </span>
  );
}

export function MemberStack({ members }: { members: string[] }) {
  return (
    <span className="flex items-center">
      {members.map((member, index) => (
        <span
          key={`${member}-${index}`}
          className={cn(
            "flex size-6 items-center justify-center rounded-full border border-card text-[0.68rem] font-semibold text-white",
            index > 0 && "-ml-2",
          )}
          style={{ backgroundColor: index === 0 ? "#1e4a44" : "#3a8d9a" }}
        >
          {member}
        </span>
      ))}
    </span>
  );
}

export function WatchListCard({ list }: { list: WatchList }) {
  const pending = list.items.filter((item) => item.status === "pending").length;
  const watched = list.items.length - pending;

  return (
    <Link
      href={list.numericId ? `/lists/${list.numericId}` : "/lists"}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-lg border bg-card p-4 text-left shadow-[0_1px_0_rgba(24,22,20,0.04)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(24,22,20,0.08)]"
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: list.color }}
      />
      <div className="flex items-start justify-between gap-4 pl-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: list.color }}
            />
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {list.name}
            </h2>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <MemberStack members={list.members} />
            <span>{pending} pendientes</span>
            <span>·</span>
            <span>{watched} vistas</span>
          </div>
        </div>
        <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {list.items.slice(0, 4).map((item) => (
          <PosterBlock key={item.id} item={item} />
        ))}
      </div>
    </Link>
  );
}

export function WatchItemRow({
  item,
  onMarkWatched,
  onOpen,
  actions,
}: {
  item: WatchItem;
  onMarkWatched?: (item: WatchItem) => void;
  onOpen?: () => void;
  actions?: React.ReactNode;
}) {
  const TypeIcon = item.type === "serie" ? TvIcon : FilmIcon;

  return (
    <div className="grid grid-cols-[72px_1fr] gap-4 rounded-lg border bg-card p-3">
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Ver detalle de ${item.title}`}
          className="block rounded-[4px] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <PosterBlock item={item} />
        </button>
      ) : (
        <PosterBlock item={item} />
      )}
      <div className="min-w-0 py-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold tracking-tight">
              {onOpen ? (
                <button
                  type="button"
                  onClick={onOpen}
                  className="text-left hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {item.title}
                </button>
              ) : (
                item.title
              )}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TypeIcon className="size-3.5" />
              {item.year} · {item.meta}
            </p>
          </div>
          <StatusChip status={item.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {actions ?? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full"
                onClick={() => onMarkWatched?.(item)}
                disabled={!onMarkWatched}
              >
                <CheckIcon className="size-3.5" />
                Marcar vista
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Compartir">
                <LinkIcon className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export type ListSortKey = "title" | "rating" | "year";
export type ListTabKey = "all" | "pending" | "watched";

const sortOptions: { key: ListSortKey; label: string }[] = [
  { key: "title", label: "Titulo" },
  { key: "rating", label: "Mejor valoradas" },
  { key: "year", label: "Mas recientes" },
];

export function SortPills({
  active,
  onChange,
}: {
  active: ListSortKey;
  onChange: (sort: ListSortKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Ordenar">
      {sortOptions.map((option) => {
        const isActive = option.key === active;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.key)}
            className={cn(
              "rounded-full px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.04em] transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ListTabs({
  active,
  counts,
  onChange,
}: {
  active: ListTabKey;
  counts: { all: number; pending: number; watched: number };
  onChange: (tab: ListTabKey) => void;
}) {
  const tabs: { key: ListTabKey; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "pending", label: "Pendientes", count: counts.pending },
    { key: "watched", label: "Vistas", count: counts.watched },
  ];

  return (
    <div className="flex gap-5 border-b" role="tablist" aria-label="Filtrar">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            <span className="ml-1.5 font-mono text-xs text-muted-foreground">
              {tab.count}
            </span>
            {isActive ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function filterAndSortItems(
  items: WatchItem[],
  {
    tab,
    query,
    sort,
  }: { tab: ListTabKey; query: string; sort: ListSortKey },
): WatchItem[] {
  const normalized = query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (tab === "pending" && item.status !== "pending") return false;
    if (tab === "watched" && item.status === "pending") return false;
    if (normalized && !item.title.toLowerCase().includes(normalized)) {
      return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return (b.year ?? 0) - (a.year ?? 0);
  });
}

export function PosterGridCard({
  item,
  rank,
  onMarkWatched,
  onSelect,
}: {
  item: WatchItem;
  rank?: number;
  onMarkWatched?: (item: WatchItem) => void;
  onSelect?: (item: WatchItem) => void;
}) {
  const watched = item.status !== "pending";
  const handleClick = onSelect ?? onMarkWatched;

  return (
    <button
      type="button"
      onClick={() => handleClick?.(item)}
      disabled={!handleClick}
      className="group flex min-w-0 flex-col gap-2 text-left"
    >
      <span className="relative block">
        <PosterBlock
          item={item}
          className="w-full transition group-hover:-translate-y-0.5"
        />
        {rank ? (
          <span className="absolute -left-2 -top-2 flex size-7 items-center justify-center rounded-full bg-foreground font-mono text-xs font-semibold text-background shadow-sm">
            {rank}
          </span>
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold tracking-tight">
          {item.title}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {item.year} · {item.meta}
        </span>
      </span>
      {watched ? (
        <span className="flex flex-wrap gap-1.5">
          <StatusChip status={item.status} />
        </span>
      ) : null}
    </button>
  );
}

const rankingOptions = [
  { key: "muchas", label: "Quiero verla", short: "Quiero", glyph: "***" },
  { key: "late", label: "Me interesa", short: "Interesa", glyph: "**" },
  { key: "igual", label: "Puede ser", short: "Quizas", glyph: "." },
  { key: "paso", label: "No me interesa", short: "No", glyph: "x" },
] as const;

export function RankingPreview() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            Futuro ranking
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">
            Interés por persona
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            UI preparada para guardar votos por usuario y ordenar después por
            coincidencia. No modifica datos todavía.
          </p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <SparklesIcon className="size-4" />
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {rankingOptions.map((option, index) => {
          const active = index === 0;
          return (
            <button
              key={option.key}
              type="button"
              disabled
              className={cn(
                "flex min-h-20 flex-col items-center justify-center gap-1 rounded-md border px-2 text-center text-xs font-medium",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-foreground",
              )}
            >
              <span className="font-mono text-sm tracking-[0.08em]">
                {option.glyph}
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <PersonVoteChip initials="T" vote="Quiero" />
        <PersonVoteChip initials="A" vote="Interesa" secondary />
        <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
          Match futuro: buen candidato
        </span>
      </div>
    </div>
  );
}

function PersonVoteChip({
  initials,
  vote,
  secondary,
}: {
  initials: string;
  vote: string;
  secondary?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
      <span
        className="flex size-4 items-center justify-center rounded-full text-[0.58rem] text-white"
        style={{ backgroundColor: secondary ? "#3a8d9a" : "#1e4a44" }}
      >
        {initials}
      </span>
      {vote}
    </span>
  );
}

export function QuickDecisionPreview() {
  const current = sampleItems[0];
  const next = sampleItems[1];

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            Decidir rapido
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Una tarjeta a la vez
          </h2>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <DicesIcon className="size-4" />
        </span>
      </div>

      <div className="grid gap-5 p-4">
        <div className="relative mx-auto h-56 w-36">
          <PosterBlock
            item={next}
            className="absolute inset-0 translate-x-4 translate-y-4 rotate-3 opacity-40"
          />
          <PosterBlock
            item={current}
            className="absolute inset-0 -rotate-2 shadow-[0_18px_40px_rgba(24,22,20,0.22)]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            El backend puede traer un pendiente aleatorio de la lista; cada
            persona responde rápido y el resumen queda listo para ordenar.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "No", icon: XIcon, active: false },
              { label: "Quizas", icon: ClockIcon, active: false },
              { label: "Interesa", icon: EyeIcon, active: false },
              { label: "Quiero", icon: SparklesIcon, active: true },
            ].map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                disabled
                className={cn(
                  "flex h-20 flex-col items-center justify-center gap-2 rounded-md border text-xs font-medium",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Vista desactivada por ahora: queda como estructura visual para una
            feature posterior, fuera del MVP actual.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SearchPanel() {
  return (
    <div className="rounded-lg border bg-card p-3 shadow-[0_1px_0_rgba(24,22,20,0.04)]">
      <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-3">
        <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar películas o series..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          disabled
        />
      </div>
    </div>
  );
}

export function InviteBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <UserPlusIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">Invita a tu persona</p>
          <p className="text-xs text-muted-foreground">
            El MVP usará enlace y email para unirse a listas compartidas.
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="rounded-full" disabled>
        <ListPlusIcon className="size-4" />
        Crear invitación
      </Button>
    </div>
  );
}

export function ComingSoonNote() {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-accent/70 p-4 text-sm text-accent-foreground">
      <SparklesIcon className="mt-0.5 size-4 shrink-0" />
      <p>
        Esta pantalla ya refleja la dirección visual. La búsqueda real se
        conectará al backend para mantener la clave del proveedor fuera del navegador.
      </p>
    </div>
  );
}
