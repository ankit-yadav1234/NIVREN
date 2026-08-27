"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { locales, supportedLocales } from "@/config/locales";
import type { Locale } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils/cn";
import { trackEvent } from "@/lib/analytics";

export function LanguageSwitcher() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchTo = (next: Locale) => {
    const segments = pathname.split("/");
    segments[1] = next; // first segment after leading slash is the locale
    router.push(segments.join("/") || "/");
    setOpen(false);
    trackEvent({ name: "language_change", locale: next });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={locales[locale].name}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{locales[locale].code.toUpperCase()}</span>
      </button>
      {open && (
        <ul className="absolute end-0 z-50 mt-1 min-w-40 rounded-[var(--radius-lg)] border border-border bg-card p-1.5 text-foreground shadow-lg">
          {supportedLocales.map((code) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => switchTo(code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent",
                  code === locale && "text-primary",
                )}
              >
                {locales[code].nativeName}
                {code === locale && <Check className="h-4 w-4" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
