"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PosterImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // A cached or SSR-prerendered image can finish loading before React attaches
  // the onLoad listener, so the event never fires and the poster would stay at
  // opacity-0 forever. Reconcile against the element's own `complete` flag on
  // mount (and whenever src changes).
  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

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
        ref={imgRef}
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
