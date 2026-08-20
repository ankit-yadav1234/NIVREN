export interface HeroBannerData {
  id: string;
  eyebrow: string;
  headingBefore: string;
  headingAccent: string;
  headingAfter: string;
  body: string;
  /** Icon registry key (see components/ui/Icon.tsx). */
  icon: string;
  /** Optional real photo for the illustration side; falls back to the icon-on-gradient panel. */
  image?: string;
  link: { label: string; href: string };
  imageSide: "left" | "right";
}

/** Powers the full-bleed HeroBanner strips on the homepage. */
export const heroBanners: HeroBannerData[] = [
  {
    id: "specialists",
    eyebrow: "Specialist Care",
    headingBefore: "Find the right ",
    headingAccent: "specialist",
    headingAfter: " for you",
    body: "Search board-certified physicians by department, language, and consultation type — then book in minutes.",
    icon: "Stethoscope",
    link: { label: "Find a Doctor", href: "/doctors" },
    imageSide: "right",
  },
  {
    id: "departments",
    eyebrow: "Every Department",
    headingBefore: "Comprehensive care, ",
    headingAccent: "all in one network",
    headingAfter: "",
    body: "From cardiology to dermatology, six specialized departments work together under one connected system.",
    icon: "Hospital",
    link: { label: "Browse Departments", href: "/departments" },
    imageSide: "left",
  },
  {
    id: "billing",
    eyebrow: "Billing & Insurance",
    headingBefore: "Transparent pricing, ",
    headingAccent: "zero surprises",
    headingAfter: "",
    body: "Know your coverage and costs before your visit, with dedicated support for claims and billing questions.",
    icon: "Receipt",
    link: { label: "View RCM Services", href: "/rcm" },
    imageSide: "right",
  },
];
