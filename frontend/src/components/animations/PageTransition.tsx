"use client";

import { usePathname } from "next/navigation";

/**
 * Subtle fade between route changes. Re-keys on pathname so the CSS entrance
 * animation replays; honors prefers-reduced-motion via globals utilities.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
