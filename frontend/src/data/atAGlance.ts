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
  {
    id: "departments",
    title: "Our Departments",
    description:
      "The network we operate ourselves — board-certified specialists across cardiology, neurology, orthopedics, pediatrics, oncology, and dermatology.",
    link: { label: "Browse Departments", href: "/departments" },
  },
  {
    id: "billing",
    title: "Insurance & Billing",
    description: "Transparent pricing, insurance support, and clear answers on coverage before your visit.",
    link: { label: "View RCM Services", href: "/rcm" },
  },
  {
    id: "doctors",
    title: "Meet Our Doctors",
    description: "Search our full directory of specialists by department, language, and consultation type.",
    link: { label: "Find a Doctor", href: "/doctors" },
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
  { label: "Book a Patient Visit", href: "/appointment" },
  { label: "Contact Our Care Team", href: "/contact" },
  { label: "Find a Location Near You", href: "/locations" },
];
