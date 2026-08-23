"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supportedLocales } from "@/config/locales";
import { cn } from "@/lib/utils/cn";

/**
 * Fixed, scroll-aware header shell.
 * - Over any page's dark top hero (not scrolled): transparent, hero shows through.
 * - Scrolled: hero-matching dark translucent background.
 * - /login and /signup have a light, hero-less background, so they stay
 *   solid the whole time — white nav text over a light page is unreadable.
 * A transparent border is kept in both states (instead of adding one only
 * when scrolled) so the header's box height never changes by that 1px,
 * which otherwise reads as the nav text "jumping" right as you scroll.
 */
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll); // initial check (async — no setState-in-effect)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isAuthPage = supportedLocales.some(
    (l) => pathname === `/${l}/login` || pathname === `/${l}/signup`,
  );
  const transparent = !isAuthPage && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b text-white transition-colors duration-300",
        transparent
          ? "border-transparent bg-transparent"
          : "border-white/10 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70",
      )}
    >
      {children}
    </header>
  );
}
