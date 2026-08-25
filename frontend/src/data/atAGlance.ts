export interface GlanceAccordionItem {
  id: string;
  title: string;
  description: string;
  link: { label: string; href: string };
}

/** Powers the "At a Glance" accordion in components/sections/MissionGlance.tsx. */
export const glanceAccordion: GlanceAccordionItem[] = [
  {
    id: "rcm",
    title: "Revenue Cycle Management",
    description:
      "End-to-end billing, coding, and denial management for hospitals and clinics — built on two decades of running our own network.",
    link: { label: "Explore RCM Services", href: "/rcm" },
  },
  // {
  //   id: "specialties",
  //   title: "Specialties We Bill For",
  //   description:
  //     "Deep coding and billing expertise across cardiology, neurology, orthopedics, pediatrics, oncology, and dermatology — proven on our own hospital network.",
  //   link: { label: "See Our Specialties", href: "/departments" },
  // },
  {
    id: "analytics",
    title: "Real-Time Reporting",
    description: "Transparent, real-time KPIs on every claim — no more waiting for a monthly summary to know where you stand.",
    link: { label: "View RCM Services", href: "/rcm" },
  },
  {
    id: "onboarding",
    title: "Fast, Clean Onboarding",
    description: "Most practices are fully transitioned within 2–3 weeks, with zero disruption to cash flow.",
    link: { label: "Request a Consultation", href: "/contact" },
  },
];

export interface QuickLink {
  label: string;
  href: string;
  /** Visually de-emphasized (still a real link) — for lower-priority items. */
  muted?: boolean;
}

/** Powers the dark quick-links band in components/sections/QuickLinksBand.tsx. */
export const quickLinks: QuickLink[] = [
  { label: "Explore RCM Services", href: "/rcm" },
  { label: "Request a Free Assessment", href: "/contact" },
  { label: "Read Client Results", href: "/about" },
  { label: "Find Doctors & Specialists", href: "/doctors" },
  { label: "Book a Patient Appointment", href: "/appointment" },
  { label: "Hospital Locations & Emergency", href: "/locations" },
];
