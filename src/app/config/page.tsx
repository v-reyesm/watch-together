"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Check, Monitor, Moon, MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  COLOR_SCHEMES,
  type ColorScheme,
  useColorScheme,
} from "@/components/color-scheme-provider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light" as const, label: "Claro", icon: Sun },
  { value: "dark" as const, label: "Oscuro", icon: Moon },
  { value: "system" as const, label: "Sistema", icon: Monitor },
] as const;

const SCHEME_SWATCHES: Record<ColorScheme, string> = {
  rosita: "bg-[#e88aa6]",
  lila: "bg-[#a98ad0]",
  bosque: "bg-[#1e4a44]",
  terracota: "bg-[#b8442a]",
  arena: "bg-[#a87a25]",
  indigo: "bg-[#2e4b7a]",
  tinta: "bg-[#26241f]",
  cereza: "bg-[#a32a3a]",
  ciruela: "bg-[#6a3a6e]",
  aqua: "bg-[#1f6a78]",
  oliva: "bg-[#6a6a2a]",
  rosa: "bg-[#b85a6e]",
};

const SCHEME_LABELS: Record<ColorScheme, string> = {
  rosita: "Rosita",
  lila: "Lila",
  bosque: "Bosque",
  terracota: "Terracota",
  arena: "Arena",
  indigo: "Indigo",
  tinta: "Tinta",
  cereza: "Cereza",
  ciruela: "Ciruela",
  aqua: "Aqua",
  oliva: "Oliva",
  rosa: "Rosa polvo",
};

const STYLE_PRESETS = [
  {
    label: "Nordico",
    description: "Claro, blanco calido, acento rosita.",
    theme: "light" as const,
    scheme: "rosita" as ColorScheme,
    icon: Sun,
    preview: {
      bg: "#fbfaf6",
      paper: "#ffffff",
      ink: "#1d2320",
      accent: "#e88aa6",
    },
  },
  {
    label: "Nordico oscuro",
    description: "Oscuro sobrio con acento rosita.",
    theme: "dark" as const,
    scheme: "rosita" as ColorScheme,
    icon: MoonStar,
    preview: {
      bg: "#151716",
      paper: "#1e211f",
      ink: "#f4f0e8",
      accent: "#e88aa6",
    },
  },
  {
    label: "Noche",
    description: "Cine oscuro con acento terracota.",
    theme: "dark" as const,
    scheme: "terracota" as ColorScheme,
    icon: Moon,
    preview: {
      bg: "#181513",
      paper: "#24201d",
      ink: "#f5eee7",
      accent: "#d86c48",
    },
  },
  {
    label: "Bosque",
    description: "Editorial verde con fondo claro.",
    theme: "light" as const,
    scheme: "bosque" as ColorScheme,
    icon: Monitor,
    preview: {
      bg: "#f7faf8",
      paper: "#ffffff",
      ink: "#1d2a27",
      accent: "#1f6a78",
    },
  },
];

function ConfigContent() {
  const { theme, setTheme } = useTheme();
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <div className="container flex max-w-4xl flex-col gap-8 py-6 md:py-10">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          aria-label="Volver al perfil"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            WatchTogether
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Estilo y acento
          </h1>
          <p className="text-muted-foreground">
            Elige una direccion visual y ajusta el color principal.
          </p>
        </div>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Preset visual</CardTitle>
          <CardDescription>
            Atajos basados en la propuesta. Cambian tema y acento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {STYLE_PRESETS.map(
            ({
              label,
              description,
              theme: presetTheme,
              scheme,
              icon: Icon,
              preview,
            }) => {
              const selected = theme === presetTheme && colorScheme === scheme;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setTheme(presetTheme);
                    setColorScheme(scheme);
                  }}
                  className={cn(
                    "grid gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50",
                    selected ? "border-primary bg-accent/30" : "border-border",
                  )}
                >
                  <span
                    className="grid h-24 rounded-md border p-2"
                    style={{ backgroundColor: preview.bg, color: preview.ink }}
                  >
                    <span
                      className="flex h-full flex-col justify-between rounded-[4px] p-2 shadow-sm"
                      style={{ backgroundColor: preview.paper }}
                    >
                      <span className="flex items-center justify-between">
                        <span
                          className="size-5 rounded-md"
                          style={{ backgroundColor: preview.accent }}
                        />
                        <Icon className="size-4 opacity-45" />
                      </span>
                      <span className="space-y-1">
                        <span
                          className="block h-2 w-20 rounded-full"
                          style={{
                            backgroundColor: preview.ink,
                            opacity: 0.85,
                          }}
                        />
                        <span
                          className="block h-2 w-14 rounded-full"
                          style={{
                            backgroundColor: preview.accent,
                            opacity: 0.75,
                          }}
                        />
                      </span>
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {label}
                      {selected ? (
                        <Check className="size-4 text-primary" />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </button>
              );
            },
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>
            Elige claro, oscuro o seguir la preferencia del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={theme === value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(value)}
              className="gap-2 rounded-full"
            >
              <Icon className="size-4" />
              {label}
              {theme === value && <Check className="size-4" />}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Color de acento</CardTitle>
          <CardDescription>
            Paleta para botones, links, chips y futuros colores de lista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme}
                type="button"
                onClick={() => setColorScheme(scheme)}
                className={cn(
                  "flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                  colorScheme === scheme
                    ? "border-primary bg-accent/30"
                    : "border-border",
                )}
              >
                <span
                  className={cn(
                    "size-10 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-background",
                    SCHEME_SWATCHES[scheme],
                    colorScheme === scheme
                      ? "ring-primary"
                      : "ring-transparent",
                  )}
                />
                <span className="text-sm font-medium">
                  {SCHEME_LABELS[scheme]}
                </span>
                {colorScheme === scheme && (
                  <Check className="text-primary size-4" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfigPage() {
  return <ConfigContent />;
}
