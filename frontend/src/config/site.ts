export const siteConfig = {
  name: "NIVREN",
  shortName: "NIVREN",
  description:
    "Revenue cycle management for hospitals and clinics — billing, coding, and denial management from the team that runs its own connected hospital network.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+91 98765 43210",
  emergencyPhone: "+91 98765 00000",
  email: "care@nivren.example",

  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
  },

  defaultLocale: "en" as const,
  supportedLocales: ["en", "hi", "ar"] as const,

  features: {
    appointments: true,
    doctorSearch: true,
    emergency: true,
    insurance: true,
    locations: true,
    testimonials: true,
    faq: true,
    themeToggle: true,
    languageSwitcher: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
