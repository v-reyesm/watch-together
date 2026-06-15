"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasGoogleClientId } from "@/components/auth/google-provider";
import { PosterBlock, sampleItems, type WatchItem } from "@/components/watch-ui";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { getTopRatedCovers } from "@/lib/watch-api";
import { itemFromTopRatedCover } from "@/lib/watch-mappers";

function isInternalPath(path: string | null): path is string {
  return Boolean(path?.startsWith("/") && !path.startsWith("//"));
}

// Placeholder covers shown until the DB query resolves (or if it returns none).
const fallbackCovers = sampleItems.slice(0, 3);

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired");
  const nextPath = searchParams.get("next");
  const redirectPath = isInternalPath(nextPath) ? nextPath : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    expired ? "Tu sesión ha expirado. Inicia sesión de nuevo." : null,
  );
  const [loading, setLoading] = useState(false);
  const [covers, setCovers] = useState<WatchItem[]>(fallbackCovers);

  useEffect(() => {
    let active = true;
    getTopRatedCovers(6).then(({ data }) => {
      if (!active || !Array.isArray(data) || data.length === 0) return;
      setCovers(data.map(itemFromTopRatedCover));
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: apiError } = await apiFetch<{ accessToken: string }>(
      "/api/auth/login",
      { method: "POST", body: { email, password } },
    );

    if (data?.accessToken) {
      await signIn(data.accessToken);
      router.push(redirectPath);
    } else {
      setError(apiError || "Credenciales inválidas");
    }
    setLoading(false);
  }

  async function handleGoogleSuccess(credentialResponse: {
    credential?: string;
  }) {
    if (!credentialResponse.credential) {
      setError("No se pudo obtener el token de Google");
      return;
    }
    setError(null);
    setLoading(true);

    const { data, error: apiError } = await apiFetch<{ accessToken: string }>(
      "/api/auth/google",
      { method: "POST", body: { idToken: credentialResponse.credential } },
    );

    if (data?.accessToken) {
      await signIn(data.accessToken);
      router.push(redirectPath);
    } else {
      setError(apiError || "Error al iniciar sesión con Google");
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen bg-background px-4 py-6 md:grid-cols-[1fr_420px] md:px-8">
      <section className="hidden flex-col justify-center pr-10 md:flex">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
          WatchTogether
        </p>
        <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight">
          Decidan juntos qué van a ver.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
          Una lista compartida para dos: agregar pelis y series, marcar lo
          visto y mantener claro qué fue juntos y qué fue solo.
        </p>
        <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
          {covers.map((item) => (
            <PosterBlock key={item.id} item={item} />
          ))}
        </div>
        <p className="mt-4 max-w-md text-xs text-muted-foreground">
          Algunas de las mejor valoradas que ya están en WatchTogether.
        </p>
      </section>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-sm rounded-lg">
        <CardHeader>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            WatchTogether
          </p>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <p className="text-muted-foreground text-sm">
            Ingresa tus credenciales para continuar
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div
              role="alert"
              className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input bg-background ring-ring/50 focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2"
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-input bg-background ring-ring/50 focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </form>

          {hasGoogleClientId ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">
                    o continúa con
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Error al iniciar sesión con Google")}
                  text="signin_with"
                  shape="rectangular"
                  width={320}
                />
              </div>
            </>
          ) : null}

          <p className="text-muted-foreground text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-primary underline-offset-4 hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
