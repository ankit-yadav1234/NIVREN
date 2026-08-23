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
    eyebrow: "For Healthcare Organizations",
    headingBefore: "Running a practice? ",
    headingAccent: "We manage your revenue cycle",
    headingAfter: "",
    body: "Beyond patient care, our RCM team partners with hospitals and clinics on coding, claims, and AR follow-up — so their staff spend less time on paperwork and more time with patients.",
    icon: "BarChart3",
    image: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1200&q=80",
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
