"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const COLOR_SCHEMES = ["violet", "blue", "emerald", "rose", "amber"] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

const STORAGE_KEY = "watchtogether-color-scheme";

function getStoredScheme(): ColorScheme {
  if (typeof window === "undefined") return "violet";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && COLOR_SCHEMES.includes(stored as ColorScheme)) {
    return stored as ColorScheme;
  }
  const fromDoc = document.documentElement.dataset.colorScheme;
  if (fromDoc && COLOR_SCHEMES.includes(fromDoc as ColorScheme)) {
    return fromDoc as ColorScheme;
  }
  return "violet";
}

const ColorSchemeContext = createContext<{
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}>({ colorScheme: "violet", setColorScheme: () => {} });

export function useColorScheme() {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) throw new Error("useColorScheme must be used within ColorSchemeProvider");
  return ctx;
}

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("violet");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setColorSchemeState(getStoredScheme());
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, scheme);
      document.documentElement.dataset.colorScheme = scheme;
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.colorScheme = colorScheme;
  }, [mounted, colorScheme]);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}
