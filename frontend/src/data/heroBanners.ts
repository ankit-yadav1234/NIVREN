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
    id: "rcm-for-providers",
    eyebrow: "Healthcare Revenue Cycle Management",
    headingBefore: "Running a practice? ",
    headingAccent: "We optimize your revenue cycle",
    headingAfter: "",
    body: "Beyond clinical excellence, our dedicated RCM team partners with hospitals, physician groups, and clinics on medical billing, clean claims coding, and denial recovery — accelerating reimbursements and maximizing collections.",
    icon: "BarChart3",
    image: "/images/general/rcm-hero-banner.jpg",
    link: { label: "Explore RCM Services", href: "/rcm" },
    imageSide: "left",
  },
];

/** The department-network banner now lives on the /departments page instead of the homepage. */
export const departmentsBanner: HeroBannerData = {
  id: "departments",
  eyebrow: "Every Department",
  headingBefore: "Comprehensive care, ",
  headingAccent: "all in one network",
  headingAfter: "",
  body: "From cardiology to dermatology, six specialized departments work together under one connected system.",
  icon: "Hospital",
  image: "https://images.unsplash.com/photo-1777269749032-d8d458ae594d?auto=format&fit=crop&w=1200&q=80",
  link: { label: "Browse Departments", href: "/departments" },
  imageSide: "left",
};
