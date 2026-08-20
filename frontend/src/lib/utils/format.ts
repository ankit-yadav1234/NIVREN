import type { Locale, OpeningHour } from "@/types";

/** Prefix a path with the active locale, e.g. localePath("/doctors","hi") -> "/hi/doctors". */
export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatOpeningHour(h: OpeningHour): { day: string; hours: string } {
  const day = DAY_NAMES[h.day] ?? "";
  const hours = h.closed ? "Closed" : `${h.opens} – ${h.closes}`;
  return { day, hours };
}

/** Strip non-dialable characters for tel: links. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function initials(name: string): string {
  return name
    .replace(/^dr\.?\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
