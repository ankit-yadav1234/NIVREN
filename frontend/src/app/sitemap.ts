import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { supportedLocales } from "@/config/locales";
import { getDoctorSlugs } from "@/lib/api/doctors";
import { getDepartmentSlugs } from "@/lib/api/departments";
import { getServiceSlugs } from "@/lib/api/services";
import { getLocationSlugs } from "@/lib/api/locations";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/doctors",
    "/departments",
    "/services",
    "/locations",
    "/appointment",
    "/about",
    "/contact",
  ];

  const dynamicPaths = [
    ...getDoctorSlugs().map((s) => `/doctors/${s}`),
    ...getDepartmentSlugs().map((s) => `/departments/${s}`),
    ...getServiceSlugs().map((s) => `/services/${s}`),
    ...getLocationSlugs().map((s) => `/locations/${s}`),
  ];

  const all = [...staticPaths, ...dynamicPaths];

  return supportedLocales.flatMap((locale) =>
    all.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
