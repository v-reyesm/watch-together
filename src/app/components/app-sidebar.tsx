"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  HomeIcon,
  ListIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getWatchLists } from "@/lib/watch-api";
import type { ApiWatchList } from "@/lib/watch-api";
import { useAuth } from "@/lib/auth";

const listDotColors = ["#e88aa6", "#a98ad0", "#3a8d9a", "#d9a05a"];

const navItems = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/search", label: "Buscar", icon: SearchIcon },
  { href: "/lists", label: "Listas", icon: ListIcon },
  { href: "/profile", label: "Perfil", icon: UserIcon },
] as const;

const comingSoonItems = [
  { href: "/coming-soon", label: "Próximamente", icon: SparklesIcon },
] as const;

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [lists, setLists] = useState<ApiWatchList[]>([]);

  useEffect(() => {
    let cancelled = false;
    function load() {
      getWatchLists().then(({ data }) => {
        if (!cancelled) setLists(data ?? []);
      });
    }
    load();
    // Refrescar cuando otra parte de la app cambia las listas o al volver al tab.
    window.addEventListener("watchlists:changed", load);
    window.addEventListener("focus", load);
    return () => {
      cancelled = true;
      window.removeEventListener("watchlists:changed", load);
      window.removeEventListener("focus", load);
    };
  }, [pathname]);

  const listParam = Number(searchParams.get("list"));
  const pathMatch = /^\/lists\/(\d+)/.exec(pathname);
  const activeListId = pathMatch
    ? Number(pathMatch[1])
    : Number.isFinite(listParam) && listParam > 0
      ? listParam
      : pathname.startsWith("/lists")
        ? lists[0]?.id
        : undefined;

  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-5">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="size-6 shrink-0 rounded-md bg-primary" />
          <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            WatchTogether
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-auto px-4 py-6">
        <section className="flex flex-col gap-2">
          <p className="px-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sidebar-foreground/45">
            Navegacion
          </p>
          <NavLinks />
        </section>

        <section className="flex flex-col gap-2">
          <p className="px-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sidebar-foreground/45">
            Mis listas
          </p>
          <div className="flex flex-col gap-0.5">
            {lists.length === 0 ? (
              <p className="px-2.5 py-1 text-xs text-sidebar-foreground/45">
                Todavía no tienes listas.
              </p>
            ) : null}
            {lists.map((list, index) => {
              const active = list.id === activeListId;
              const pending = list.pendingCount;

              return (
                <Link
                  key={list.id}
                  href={`/lists?list=${list.id}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          listDotColors[index % listDotColors.length],
                      }}
                    />
                    <span className="truncate">{list.name}</span>
                  </span>
                  <span className="font-mono text-[0.68rem] text-sidebar-foreground/45">
                    {pending}
                  </span>
                </Link>
              );
            })}

            <Link
              href="/lists/new"
              className="mt-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            >
              <PlusIcon className="size-3.5" />
              Nueva lista
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <p className="px-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sidebar-foreground/45">
            Próximamente
          </p>
          <div className="flex flex-col gap-0.5">
            {comingSoonItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-auto border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {(user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name ?? "Invitado"}
            </div>
            <div className="truncate text-[0.68rem] text-sidebar-foreground/45">
              {user?.email ?? ""}
            </div>
          </div>
          <Link
            href="/config"
            className="flex size-8 items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Ajustes"
          >
            <MoreHorizontalIcon className="size-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-[252px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <Suspense fallback={null}>
        <SidebarContent />
      </Suspense>
    </aside>
  );
}

export function AppSidebarNavLinks() {
  return <NavLinks />;
}
