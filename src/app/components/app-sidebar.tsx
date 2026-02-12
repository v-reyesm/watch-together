"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/lists", label: "My Lists", icon: ListIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
] as const;

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/" className="font-semibold text-primary">
          WatchTogether
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
        <NavLinks />
      </div>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <Link
          href="/config"
          className="text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <SettingsIcon className="size-5 shrink-0" />
          Config
        </Link>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <>
      {/* Desktop only: fixed left sidebar. Mobile uses MobileBottomNav. */}
      <aside className="hidden w-56 flex-col border-r border-sidebar-border bg-sidebar md:flex md:shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}

export function AppSidebarNavLinks() {
  return <NavLinks />;
}
