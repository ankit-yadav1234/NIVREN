"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Infinite, auto-looping horizontal card carousel.
 * - Slides are duplicated so it scrolls seamlessly in a circle (no visible jump).
 * - Advances one card every `intervalMs` (default 3s). Pauses on hover.
 * - Each card carries its own animated border glow (see .glow-card in globals.css).
 */
export function CardCarousel({
  slides,
  intervalMs = 3000,
  cardClassName = "w-[17rem]",
}: {
  slides: React.ReactNode[];
  intervalMs?: number;
  cardClassName?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [paused, setPaused] = React.useState(false);

  // Auto-advance, wrapping seamlessly through the duplicated set.
  React.useEffect(() => {
    if (paused) return;
    const track = trackRef.current;
    if (!track) return;
    const id = window.setInterval(() => {
      const cards = track.children;
      if (cards.length < 2) return;
      const step =
        (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft ||
        (cards[0] as HTMLElement).offsetWidth;
      const half = track.scrollWidth / 2;
      if (track.scrollLeft >= half - 1) {
        track.scrollLeft -= half; // jump back into the first copy (identical → seamless)
      }
      track.scrollBy({ left: step, behavior: "smooth" });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [paused, intervalMs]);

  const doubled = [
    ...slides.map((s, i) => (
      <div key={`a-${i}`} className={cn("glow-card shrink-0", cardClassName)}>
        {s}
      </div>
    )),
    ...slides.map((s, i) => (
      <div key={`b-${i}`} aria-hidden className={cn("glow-card shrink-0", cardClassName)}>
        {s}
      </div>
    )),
  ];

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {doubled}
      </div>
    </div>
  );
}
