export interface GlanceAccordionItem {
  id: string;
  title: string;
  description: string;
  link: { label: string; href: string };
}

/** Powers the "At a Glance" accordion in components/sections/MissionGlance.tsx. */
export const glanceAccordion: GlanceAccordionItem[] = [
  {
    id: "updates",
    title: "Patient Care Updates",
    description:
      "Stay informed about new specialists, expanded hours, and the programs shaping care across our network.",
    link: { label: "Read More", href: "/about" },
  },
  {
    id: "departments",
    title: "Our Departments",
    description:
      "Explore board-certified specialists across cardiology, neurology, orthopedics, pediatrics, oncology, and dermatology.",
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
  { label: "Book Now", href: "/appointment" },
  { label: "Contact Our Care Team", href: "/contact" },
  { label: "Find a Location Near You", href: "/locations" },
  { label: "Explore Career Opportunities", href: "/contact", muted: true },
];
