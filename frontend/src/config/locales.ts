import type { Locale, LocaleMeta } from "@/types";

export const locales: Record<Locale, LocaleMeta> = {
  en: { code: "en", name: "English", nativeName: "English", direction: "ltr" },
  hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी", direction: "ltr" },
  ar: { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl" },
};

export const supportedLocales: Locale[] = ["en", "hi", "ar"];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (supportedLocales as string[]).includes(value);
}

export function getDirection(locale: Locale) {
  return locales[locale].direction;
}
