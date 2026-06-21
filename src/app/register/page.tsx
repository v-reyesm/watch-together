"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/auth/password-input";
import { PosterBlock, sampleItems, StatusChip } from "@/components/watch-ui";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    const { data, error: apiError } = await apiFetch<{ accessToken: string }>(
      "/api/auth/register",
      { method: "POST", body: { email, password, name } },
    );

    if (data?.accessToken) {
      await signIn(data.accessToken);
      router.push("/");
    } else {
      setError(apiError || "Error al registrar la cuenta");
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
          Una lista para ustedes dos.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
          Crea tu cuenta, arma una lista compartida e invita por enlace o email
          cuando el flujo de invitaciones esté conectado.
        </p>
        <div className="mt-8 grid max-w-sm grid-cols-3 gap-2">
          {sampleItems.slice(0, 3).map((item) => (
            <PosterBlock key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-4">
          <StatusChip status="watchedTogether" />
        </div>
      </section>

      <div className="flex items-center justify-center">
      <Card className="w-full max-w-sm rounded-lg">
        <CardHeader>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            WatchTogether
          </p>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <p className="text-muted-foreground text-sm">
            Completa los datos para registrarte
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

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-input bg-background ring-ring/50 focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2"
                placeholder="Tu nombre"
              />
            </div>
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
              <PasswordInput
                id="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/sign-in"
              className="text-primary underline-offset-4 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
