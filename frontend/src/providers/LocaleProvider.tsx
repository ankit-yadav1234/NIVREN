"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "@/content/schema";
import type { Direction, Locale } from "@/types";
import { locales } from "@/config/locales";

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  direction: Direction;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const direction = locales[locale].direction;
  return (
    <LocaleContext.Provider value={{ locale, dict, direction }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocaleContext must be used within LocaleProvider");
  return ctx;
}
