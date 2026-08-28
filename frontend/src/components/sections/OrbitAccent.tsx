"use client";

import * as React from "react";

/**
 * Decorative tilted-ellipse orbit — matches the reference exactly: one
 * solid glowing main ellipse with two small arrowheads (top pointing
 * right, bottom pointing left) and exactly two glowing nodes travelling
 * it, plus one fainter DOTTED ellipse behind it (smaller, offset, no
 * extra nodes on it — pure decoration). Purely decorative (aria-hidden,
 * pointer-events-none). Used ONLY on the Contact page header — see
 * contact/page.tsx.
 *
 * SVG + SMIL animateMotion (not CSS keyframes) because it's the only way to
 * trace nodes precisely along a *tilted ellipse* — every node's/arrow's
 * path lives in the same rotated <g> as the ring, so nothing can drift
 * apart, and `rotate="auto"` keeps the arrows aligned to the path tangent
 * for free. SMIL has no CSS off-switch, so this is a client component
 * purely to check prefers-reduced-motion and swap in static nodes/arrows
 * when set.
 */
// sweep-flag=1 — traces the ellipse so the top half moves left-to-right and
// the bottom half right-to-left, matching the reference's arrows exactly.
const MAIN_PATH = "M20,150 A130,68 0 1,1 280,150 A130,68 0 1,1 20,150";

/** A small chevron that travels the path, auto-rotating to always point the way it's moving. */
function TravellingArrow({ begin }: { begin: string }) {
  return (
    // animateMotion goes on a wrapping <g>, not directly on the <path> —
    // putting it on the path itself (which has its own `d` for the arrow
    // shape) silently fails to animate; a plain group as the motion target
    // is the reliable pattern.
    <g>
      <animateMotion dur="16s" repeatCount="indefinite" begin={begin} rotate="auto" path={MAIN_PATH} />
      <path
        d="M -4,-3 L 4,0 L -4,3"
        stroke="rgba(165,243,252,0.7)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function OrbitAccent() {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      aria-hidden
      className={
        // Rendered as PageHeader's `headerAccent`, INSIDE its content
        // column (not a sibling section after it) — see contact/page.tsx
        // and PageHeader.tsx. That means:
        //
        // Phone AND tablet (<lg): normal document flow, first thing in the
        // content column — the circle sits ABOVE the title/subtitle, and
        // only adds as much page height as it actually needs (no separate
        // full-height block, no big empty gap below the header text). Kept
        // the same on tablet as on phone on purpose — there's no reliable
        // empty side-gutter until the two-column-width laptop tier.
        //
        // lg+ (laptop, desktop): absolute, positioned relative to the
        // header's own content container and vertically centered at every
        // tier (never pinned near the top edge), floating over the empty
        // right side next to the left-aligned text. No z-index needed — it
        // renders after the background layers in DOM order, which is
        // enough to paint on top of them.
        "pointer-events-none relative mx-auto mb-6 opacity-60 " +
        "lg:absolute lg:mx-0 lg:mb-0 lg:right-[5%] lg:top-1/2 lg:-translate-y-1/2 lg:opacity-80 " +
        "xl:right-[4%] xl:opacity-90"
      }
      style={{ width: "clamp(190px, 26vw, 600px)", height: "clamp(190px, 26vw, 600px)" }}
    >
      {/* Soft ambient glow behind everything */}
      <div className="absolute inset-[12%] rounded-full bg-cyan-400/20 blur-[60px]" />

      <svg viewBox="0 0 300 300" className="relative h-full w-full" fill="none">
        <g transform="rotate(70 150 150)">
          {/* Background orbit — one fainter ellipse made only of small dots,
              the SAME size as the main ring (just offset a little), sitting
              behind it. Drawn first so the main ring paints over it. */}
          <ellipse
            cx="164"
            cy="162"
            rx="130"
            ry="68"
            stroke="rgba(165,243,252,0.22)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="0.5 6"
          />

          {/* The main ring */}
          <ellipse cx="150" cy="150" rx="130" ry="68" stroke="rgba(165,243,252,0.35)" strokeWidth="1.25" />

          {reducedMotion ? (
            <>
              <circle cx="20" cy="150" r="5.5" fill="#67e8f9" style={{ filter: "drop-shadow(0 0 7px rgba(103,232,249,0.9))" }} />
              <circle cx="280" cy="150" r="5.5" fill="#67e8f9" style={{ filter: "drop-shadow(0 0 7px rgba(103,232,249,0.9))" }} />
              <path d="M -4,-3 L 4,0 L -4,3" transform="translate(176.85,66.5) rotate(-13.2)" stroke="rgba(165,243,252,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M -4,-3 L 4,0 L -4,3" transform="translate(123.15,233.5) rotate(166.8)" stroke="rgba(165,243,252,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <>
              {/* Exactly two glowing nodes travelling the main ring, opposite each other */}
              <circle r="6" fill="#67e8f9" style={{ filter: "drop-shadow(0 0 8px rgba(103,232,249,0.9))" }}>
                <animateMotion dur="16s" repeatCount="indefinite" begin="0s" path={MAIN_PATH} />
              </circle>
              <circle r="6" fill="#67e8f9" style={{ filter: "drop-shadow(0 0 8px rgba(103,232,249,0.9))" }}>
                <animateMotion dur="16s" repeatCount="indefinite" begin="-8s" path={MAIN_PATH} />
              </circle>

              {/* Exactly two arrowheads travelling the main ring */}
              <TravellingArrow begin="-4s" />
              <TravellingArrow begin="-12s" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
