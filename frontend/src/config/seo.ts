import { siteConfig } from "./site";

export const seoConfig = {
  titleTemplate: `%s | ${siteConfig.name}`,
  defaultTitle: `${siteConfig.name} — ${siteConfig.description}`,
  defaultDescription: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    images: [{ url: "/images/general/placeholder.svg", width: 640, height: 400 }],
  },
  twitter: {
    card: "summary_large_image" as const,
  },
};
