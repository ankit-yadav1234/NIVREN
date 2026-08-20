import type { Locale } from "@/types";
import { defaultLocale, isLocale } from "@/config/locales";
import type { Dictionary } from "./schema";
import { en } from "./en";
import { hi } from "./hi";
import { ar } from "./ar";

const dictionaries: Record<Locale, Dictionary> = { en, hi, ar };

/** Resolve typed content for a locale, falling back to the default. */
export function getContent(locale: string): Dictionary {
  if (isLocale(locale)) return dictionaries[locale];
  return dictionaries[defaultLocale];
}

export type { Dictionary };
