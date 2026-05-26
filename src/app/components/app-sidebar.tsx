"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { sampleLists } from "@/components/watch-ui";

const navItems = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/search", label: "Buscar", icon: SearchIcon },
  { href: "/lists", label: "Listas", icon: ListIcon },
  { href: "/profile", label: "Perfil", icon: UserIcon },
] as const;

const comingSoonItems = [
  { href: "/coming-soon", label: "Coming soon", icon: SparklesIcon },
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
            {sampleLists.map((list) => {
              const active =
                pathname.startsWith("/lists") && list.id === "friday";
              const pending = list.items.filter(
                (item) => item.status === "pending",
              ).length;

              return (
                <Link
                  key={list.id}
                  href="/lists"
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
                      style={{ backgroundColor: list.color }}
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
            Invitaciones
          </p>
          <div className="rounded-lg border border-dashed border-sidebar-border px-3 py-2 text-xs leading-5 text-sidebar-foreground/70">
            <b className="font-semibold text-sidebar-foreground">Ana</b> te
            invito a <i>Plan de domingo</i>
            <div className="text-[0.68rem] text-sidebar-foreground/45">
              hace 2 horas
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <p className="px-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sidebar-foreground/45">
            Coming soon
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
            T
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-sidebar-foreground">
              Tu
            </div>
            <div className="truncate text-[0.68rem] text-sidebar-foreground/45">
              tu@email.com
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
      <SidebarContent />
    </aside>
  );
}

export function AppSidebarNavLinks() {
  return <NavLinks />;
}
