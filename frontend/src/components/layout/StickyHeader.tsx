"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supportedLocales } from "@/config/locales";
import { cn } from "@/lib/utils/cn";

/**
 * Fixed, scroll-aware header shell.
 * - Over the home hero (top, not scrolled): transparent (video shows through).
 * - Scrolled, or on inner pages: hero-matching dark translucent background.
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

  const isHome = supportedLocales.some((l) => pathname === `/${l}`);
  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 text-white transition-colors duration-300",
        transparent
          ? "bg-transparent"
          : "border-b border-white/10 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70",
      )}
    >
      {children}
    </header>
  );
}
