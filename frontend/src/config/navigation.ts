import type { NavigationItem } from "@/types";
import { departments } from "@/data/departments";
import { services } from "@/data/services";
import { rcmServices } from "@/data/rcmServices";

/**
 * Dropdown children are derived from the real content data (departments.ts,
 * services.ts, rcmServices.ts) instead of being hand-duplicated here, so the
 * menu icon/description/list always matches the actual pages — and can't
 * silently drift out of sync (e.g. list only 4 of 6 departments).
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

const departmentChildren: NavigationItem[] = [
  { label: "All Departments", labelKey: "allDepartments", href: "/departments", icon: "LayoutGrid" },
  ...departments.map((d) => ({
    label: d.name,
    href: `/departments/${d.slug}`,
    icon: d.icon,
    description: d.description,
  })),
];

const serviceChildren: NavigationItem[] = [
  { label: "All Services", labelKey: "allServices", href: "/services", icon: "LayoutGrid" },
  ...services.map((s) => ({
    label: s.title,
    href: `/services/${s.slug}`,
    icon: s.icon,
    description: s.description,
  })),
];

const resourcesChildren: NavigationItem[] = [
  {
    label: "Our Locations",
    href: "/locations",
    icon: "MapPin",
    description: "Find the NIVREN facility closest to you.",
  },
  {
    label: "Frequently Asked Questions",
    href: "/faq",
    icon: "HelpCircle",
    description: "Answers to common questions about our care and services.",
  },
  {
    label: "Get in Touch",
    href: "/contact",
    icon: "Phone",
    description: "Questions, feedback, or support — reach our care team.",
  },
];

/** Primary navigation. Items with `children` render as a dropdown. */
export const mainNavigation: NavigationItem[] = [
  { label: "RCM Services", href: "/rcm", children: rcmChildren },
  { label: "Departments", labelKey: "departments", href: "/departments", children: departmentChildren },
  { label: "Doctors", labelKey: "doctors", href: "/doctors" },
  { label: "Services", labelKey: "services", href: "/services", children: serviceChildren },
  { label: "About", labelKey: "about", href: "/about" },
  { label: "Resources", href: "/contact", children: resourcesChildren },
];

export const footerNavigation = {
  quickLinks: [
    { label: "RCM Services", href: "/rcm", icon: "Receipt" },
    { label: "About", labelKey: "about", href: "/about", icon: "Info" },
    { label: "Doctors", labelKey: "doctors", href: "/doctors", icon: "Stethoscope" },
    { label: "Departments", labelKey: "departments", href: "/departments", icon: "LayoutGrid" },
    { label: "Contact", labelKey: "contact", href: "/contact", icon: "Phone" },
  ] as NavigationItem[],
  services: [
    {
      label: "Health Checkup",
      href: "/services/health-checkup",
      icon: services.find((s) => s.slug === "health-checkup")?.icon,
      description: services.find((s) => s.slug === "health-checkup")?.description,
    },
    {
      label: "Diagnostics",
      href: "/services/diagnostics",
      icon: services.find((s) => s.slug === "diagnostics")?.icon,
      description: services.find((s) => s.slug === "diagnostics")?.description,
    },
    {
      label: "Emergency Care",
      href: "/services/emergency-care",
      icon: services.find((s) => s.slug === "emergency-care")?.icon,
      description: services.find((s) => s.slug === "emergency-care")?.description,
    },
    { label: "Appointments", href: "/appointment", icon: "Calendar" },
  ] as NavigationItem[],
  legal: [
    { label: "Privacy Policy", labelKey: "privacyPolicy", href: "/privacy" },
    { label: "Terms of Service", labelKey: "termsOfService", href: "/terms" },
    { label: "Medical Disclaimer", labelKey: "medicalDisclaimer", href: "/disclaimer" },
    { label: "Accessibility", labelKey: "accessibilityStatement", href: "/accessibility" },
  ] as NavigationItem[],
};
