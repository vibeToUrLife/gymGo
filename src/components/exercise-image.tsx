"use client";

import { useEffect, useState } from "react";
import { imageUrl } from "@/lib/exercises";

/**
 * Cross-fades between the two public-domain frames (start pose -> end pose)
 * to create a looping "how-to" animation. Falls back to a static first frame
 * when there is only one image or the user prefers reduced motion.
 */
export function ExerciseImage({
  images,
  name,
  className,
  play = true,
  intervalMs = 1100,
}: {
  images: string[];
  name: string;
  className?: string;
  play?: boolean;
  intervalMs?: number;
}) {
  const hasTwo = images.length >= 2;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!hasTwo || !play) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => setFlipped((f) => !f), intervalMs);
    return () => clearInterval(id);
  }, [hasTwo, play, intervalMs]);

  return (
    <div className={`relative overflow-hidden bg-white ${className ?? ""}`}>
      {images[0] ? (
        <>
          <img
            src={imageUrl(images[0])}
            alt={name}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {hasTwo && (
            <img
              src={imageUrl(images[1])}
              alt=""
              aria-hidden="true"
              loading="lazy"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
              style={{ opacity: flipped ? 1 : 0 }}
            />
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-300">
          <span className="text-4xl">🏋️</span>
        </div>
      )}
    </div>
  );
}
