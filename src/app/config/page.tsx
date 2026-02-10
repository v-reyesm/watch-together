"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Check,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useColorScheme,
  COLOR_SCHEMES,
  type ColorScheme,
} from "@/components/color-scheme-provider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
] as const;

const SCHEME_SWATCHES: Record<ColorScheme, string> = {
  violet: "bg-[oklch(0.48_0.2_285)]",
  blue: "bg-[oklch(0.45_0.2_250)]",
  emerald: "bg-[oklch(0.5_0.16_165)]",
  rose: "bg-[oklch(0.55_0.2_350)]",
  amber: "bg-[oklch(0.65_0.18_75)]",
};

function ConfigContent() {
  const { theme, setTheme } = useTheme();
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <div className="container flex flex-col gap-8 py-6 md:py-8">
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          aria-label="Back to profile"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Config</h1>
          <p className="text-muted-foreground">Appearance and preferences</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose light, dark, or follow your system preference.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={theme === value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(value)}
              className="gap-2"
            >
              <Icon className="size-4" />
              {label}
              {theme === value && <Check className="size-4" />}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Color scheme</CardTitle>
          <CardDescription>
            Pick a color for buttons, links, and accents across the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme}
                type="button"
                onClick={() => setColorScheme(scheme)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-accent/50",
                  colorScheme === scheme
                    ? "border-primary bg-accent/30"
                    : "border-border"
                )}
              >
                <span
                  className={cn(
                    "size-10 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-background",
                    SCHEME_SWATCHES[scheme],
                    colorScheme === scheme ? "ring-primary" : "ring-transparent"
                  )}
                />
                <span className="text-sm font-medium capitalize">{scheme}</span>
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
