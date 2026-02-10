"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ListIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/lists", label: "My Lists", icon: ListIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]"
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className={cn("size-6 shrink-0", isActive && "fill-primary")}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
