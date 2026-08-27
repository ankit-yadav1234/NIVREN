import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";
import { supportedLocales } from "@/config/locales";
import type { Department, Doctor, Location, Service } from "@/types";
import type { Locale } from "@/types";

interface PageMetaInput {
  /** Current locale — required so canonical/hreflang point at the actual localized URL, not a locale-less path. */
  locale: Locale;
  title: string;
  description?: string;
  path?: string;
  image?: string;
  /** Set true for dormant/legacy pages that still build but shouldn't be indexed (see siteConfig.features). */
  noindex?: boolean;
}

export function buildMetadata({ locale, title, description, path, image, noindex }: PageMetaInput): Metadata {
  const desc = description ?? seoConfig.defaultDescription;
  const suffix = path ?? "";
  const url = `${siteConfig.url}/${locale}${suffix}`;
  const languages = Object.fromEntries(
    supportedLocales.map((l) => [l, `${siteConfig.url}/${l}${suffix}`]),
  );

  return {
    title,
    description: desc,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale,
      images: image ? [{ url: image }] : seoConfig.openGraph.images,
    },
    twitter: { card: "summary_large_image", title, description: desc },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function getDoctorMetadata(doctor: Doctor, locale: Locale): Metadata {
  return buildMetadata({
    locale,
    title: `${doctor.name} — ${doctor.specialty}`,
    description: doctor.bio,
    path: `/doctors/${doctor.slug}`,
    image: doctor.image,
    noindex: true, // dormant patient-directory feature (siteConfig.features.doctorSearch = false)
  });
}

export function getDepartmentMetadata(dept: Department, locale: Locale): Metadata {
  return buildMetadata({
    locale,
    title: dept.name,
    description: dept.description,
    path: `/departments/${dept.slug}`,
    image: dept.image,
  });
}

export function getServiceMetadata(service: Service, locale: Locale): Metadata {
  return buildMetadata({
    locale,
    title: service.title,
    description: service.description,
    path: `/services/${service.slug}`,
    image: service.image,
    noindex: true, // dormant patient-services feature, superseded by /rcm
  });
}

export function getLocationMetadata(location: Location, locale: Locale): Metadata {
  return buildMetadata({
    locale,
    title: location.name,
    description: `${location.name}, ${location.city} — ${location.address}`,
    path: `/locations/${location.slug}`,
    image: location.image,
    noindex: true, // dormant patient-facing feature (siteConfig.features.locations = false)
  });
}
