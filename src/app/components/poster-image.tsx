"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function PosterImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) return null;

  return (
    <>
      {/* Gentle shimmer placeholder shown until the poster finishes loading. */}
      {!loaded ? (
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse bg-black/10"
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </>
  );
}
