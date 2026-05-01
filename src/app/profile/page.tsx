"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const { error } = await apiFetch("/api/users/me", {
      method: "PATCH",
      body: { name: displayName },
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const initials = (user?.name ?? "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container flex flex-col gap-8 py-6 md:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Perfil
        </h1>
        <p className="text-muted-foreground">Tu cuenta y preferencias</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="size-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
                {initials}
              </div>
            )}
            <div>
              <CardTitle>{user?.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-medium">
              Nombre para mostrar
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border-input bg-background ring-ring/50 focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2"
            />
          </div>

          <Link
            href="/config"
            className="border-border hover:bg-accent/50 flex items-center justify-between gap-2 rounded-lg border px-3 py-3 transition-colors"
          >
            <span className="flex items-center gap-2">
              <SettingsIcon className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">Apariencia y tema</span>
            </span>
            <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
          </Link>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground justify-start"
              onClick={signOut}
            >
              Cerrar sesión →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
