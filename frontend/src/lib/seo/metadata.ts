import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";
import type { Department, Doctor, Location, Service } from "@/types";

interface PageMetaInput {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}

export function buildMetadata({ title, description, path, image }: PageMetaInput): Metadata {
  const desc = description ?? seoConfig.defaultDescription;
  const url = path ? `${siteConfig.url}${path}` : siteConfig.url;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: image ? [{ url: image }] : seoConfig.openGraph.images,
    },
    twitter: { card: "summary_large_image", title, description: desc },
    robots: { index: true, follow: true },
  };
}

export function getDoctorMetadata(doctor: Doctor): Metadata {
  return buildMetadata({
    title: `${doctor.name} — ${doctor.specialty}`,
    description: doctor.bio,
    path: `/doctors/${doctor.slug}`,
    image: doctor.image,
  });
}

export function getDepartmentMetadata(dept: Department): Metadata {
  return buildMetadata({
    title: dept.name,
    description: dept.description,
    path: `/departments/${dept.slug}`,
    image: dept.image,
  });
}

export function getServiceMetadata(service: Service): Metadata {
  return buildMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${service.slug}`,
    image: service.image,
  });
}

export function getLocationMetadata(location: Location): Metadata {
  return buildMetadata({
    title: location.name,
    description: `${location.name}, ${location.city} — ${location.address}`,
    path: `/locations/${location.slug}`,
    image: location.image,
  });
}
