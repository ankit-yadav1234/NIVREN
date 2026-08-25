import type { NavigationItem } from "@/types";
import { departments } from "@/data/departments";
import { rcmServices } from "@/data/rcmServices";

/**
 * Dropdown children are derived from the real content data (departments.ts,
 * rcmServices.ts) instead of being hand-duplicated here, so the menu icon/
 * description/list always matches the actual pages — and can't silently
 * drift out of sync (e.g. list only 4 of 6 specialties).
 */
const rcmChildren: NavigationItem[] = [
  { label: "All RCM Services", href: "/rcm", icon: "LayoutGrid" },
  ...rcmServices.map((s) => ({
    label: s.title,
    href: `/rcm/${s.slug}`,
    icon: s.icon,
    description: s.tagline,
  })),
];

const specialtyChildren: NavigationItem[] = [
  { label: "All Specialties", href: "/departments", icon: "LayoutGrid" },
  ...departments.map((d) => ({
    label: d.name,
    href: `/departments/${d.slug}`,
    icon: d.icon,
    description: d.description,
  })),
];

const aboutChildren: NavigationItem[] = [
  { label: "Our Story", href: "/about", icon: "Info", description: "Mission, values, and how NIVREN got here." },
  { label: "Leadership", href: "/about/leadership", icon: "HeartHandshake", description: "The team behind the operations." },
  { label: "Careers", href: "/about/careers", icon: "Users", description: "Open roles and what it's like to work here." },
];

const resourcesChildren: NavigationItem[] = [
  { label: "Case Studies", href: "/case-studies", icon: "BarChart3", description: "Real results from providers we work with." },
  { label: "FAQ", href: "/faq", icon: "HelpCircle", description: "Common questions about working with NIVREN." },
];

/** Primary navigation. Items with `children` render as a dropdown. */
export const mainNavigation: NavigationItem[] = [
  { label: "RCM Services", href: "/rcm", children: rcmChildren },
  // { label: "Specialties We Bill For", href: "/departments", children: specialtyChildren },
  { label: "Who We Serve", href: "/who-we-serve" },
  { label: "About", labelKey: "about", href: "/about", children: aboutChildren },
  { label: "Resources", href: "/case-studies", children: resourcesChildren },
  { label: "Contact", labelKey: "contact", href: "/contact" },
];

export const footerNavigation = {
  quickLinks: [
    { label: "RCM Services", href: "/rcm", icon: "Receipt" },
    { label: "Who We Serve", href: "/who-we-serve", icon: "Activity" },
    { label: "About", labelKey: "about", href: "/about", icon: "Info" },
    { label: "Leadership", href: "/about/leadership", icon: "HeartHandshake" },
    { label: "Careers", href: "/about/careers", icon: "Users" },
    { label: "Case Studies", href: "/case-studies", icon: "BarChart3" },
    { label: "FAQ", href: "/faq", icon: "HelpCircle" },
    { label: "Contact", labelKey: "contact", href: "/contact", icon: "Phone" },
  ] as NavigationItem[],
  services: [
    {
      label: "Medical Billing",
      href: "/rcm/medical-billing",
      icon: rcmServices.find((s) => s.slug === "medical-billing")?.icon,
      description: rcmServices.find((s) => s.slug === "medical-billing")?.tagline,
    },
    {
      label: "Medical Coding",
      href: "/rcm/medical-coding",
      icon: rcmServices.find((s) => s.slug === "medical-coding")?.icon,
      description: rcmServices.find((s) => s.slug === "medical-coding")?.tagline,
    },
    {
      label: "Denial Management",
      href: "/rcm/denial-management",
      icon: rcmServices.find((s) => s.slug === "denial-management")?.icon,
      description: rcmServices.find((s) => s.slug === "denial-management")?.tagline,
    },
    { label: "All RCM Services", href: "/rcm", icon: "LayoutGrid" },
  ] as NavigationItem[],
  legal: [
    { label: "Privacy Policy", labelKey: "privacyPolicy", href: "/privacy" },
    { label: "Terms of Service", labelKey: "termsOfService", href: "/terms" },
    { label: "Medical Disclaimer", labelKey: "medicalDisclaimer", href: "/disclaimer" },
    { label: "Accessibility", labelKey: "accessibilityStatement", href: "/accessibility" },
  ] as NavigationItem[],
};
