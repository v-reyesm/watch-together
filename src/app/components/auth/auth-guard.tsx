"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const PUBLIC_PATHS = ["/sign-in", "/register"];

function isInternalPath(path: string | null): path is string {
  return Boolean(path?.startsWith("/") && !path.startsWith("//"));
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  useEffect(() => {
    if (isLoading) return;

    if (!user && !isPublic) {
      const next = `${pathname}${window.location.search}`;
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
    }

    if (user && isPublic) {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(isInternalPath(next) ? next : "/");
    }
  }, [user, isLoading, isPublic, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Cargando...</div>
      </div>
    );
  }

  if (!user && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Redirigiendo al inicio de sesión...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
