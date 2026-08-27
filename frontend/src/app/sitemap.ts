import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { supportedLocales } from "@/config/locales";
import { getRcmServiceSlugs } from "@/lib/api/rcm";
import { getDepartmentSlugs } from "@/lib/api/departments";

/**
 * Only the pages that are actually live for the current RCM-provider
 * business — the old patient-facing pages (doctors, locations, patient
 * services, appointment) are dormant (see siteConfig.features) and marked
 * noindex in their own metadata, so they're deliberately left out here too.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    { path: "", priority: 1 },
    { path: "/rcm", priority: 0.9 },
    { path: "/who-we-serve", priority: 0.8 },
    { path: "/departments", priority: 0.7 },
    { path: "/case-studies", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/about/leadership", priority: 0.5 },
    { path: "/about/careers", priority: 0.5 },
    { path: "/faq", priority: 0.6 },
    { path: "/contact", priority: 0.8 },
  ];

  const dynamicPaths = [
    ...getRcmServiceSlugs().map((s) => ({ path: `/rcm/${s}`, priority: 0.8 })),
    ...getDepartmentSlugs().map((s) => ({ path: `/departments/${s}`, priority: 0.6 })),
  ];

  const all = [...staticPaths, ...dynamicPaths];

  return supportedLocales.flatMap((locale) =>
    all.map(({ path, priority }) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(supportedLocales.map((l) => [l, `${siteConfig.url}/${l}${path}`])),
      },
    })),
  );
}
