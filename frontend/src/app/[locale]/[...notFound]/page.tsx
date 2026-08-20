import { notFound } from "next/navigation";

/**
 * Catches any path under /[locale]/* that doesn't match a real page.
 * Without this, Next.js can't tell the [locale] layout should be entered at
 * all for a totally unmatched path, so it silently falls back to its bare
 * built-in 404 instead of rendering our themed app/[locale]/not-found.tsx.
 * This forces the match, then hands off to that not-found boundary.
 */
export default function CatchAll() {
  notFound();
}
