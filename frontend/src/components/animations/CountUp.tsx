"use client";

import * as React from "react";

/**
 * Animates a stat value from 0 up to its target automatically on mount
 * (e.g. "50k+" -> counts 0..50 then appends "k+"). Runs once; honors
 * prefers-reduced-motion by showing the final value immediately. Values
 * that aren't a leading number (no match) render as plain static text.
 */
export function CountUp({
  value,
  duration = 1500,
  delay = 0,
}: {
  value: string;
  duration?: number;
  /** Seconds to wait before starting (lets it line up with the entrance stagger). */
  delay?: number;
}) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[1]) : null;
  const suffix = match ? match[2] : "";
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;

  const [display, setDisplay] = React.useState("0");

  React.useEffect(() => {
    if (target === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target.toFixed(decimals));
      return;
    }
    let raf = 0;
    let start = 0;
    const timeout = window.setTimeout(() => {
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min(1, (ts - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setDisplay((target * eased).toFixed(decimals));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay * 1000);
    return () => {
      window.clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, delay, decimals]);

  if (target === null) return <>{value}</>;
  return (
    <>
      {display}
      {suffix}
    </>
  );
}
