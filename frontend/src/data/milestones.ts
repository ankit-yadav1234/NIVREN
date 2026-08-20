export interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  /** Icon registry key (see components/ui/Icon.tsx). */
  icon: string;
  link: { label: string; href: string };
}

/** Powers the scroll-driven "Our Journey" timeline on the About page. */
export const milestones: Milestone[] = [
  {
    id: "founded",
    year: "2005",
    title: "NIVREN is founded",
    description:
      "We opened our first clinic with a simple promise: treat every patient like family, backed by real clinical expertise.",
    icon: "HeartPulse",
    link: { label: "Read our mission", href: "/about" },
  },
  {
    id: "expansion",
    year: "2012",
    title: "Expanding specialty care",
    description:
      "Cardiology, neurology, and orthopedics joined our network, bringing board-certified specialists together under one roof.",
    icon: "Stethoscope",
    link: { label: "Browse departments", href: "/departments" },
  },
  {
    id: "emergency",
    year: "2018",
    title: "24/7 emergency & advanced diagnostics",
    description:
      "A dedicated emergency department and a modern diagnostics center opened, cutting wait times and catching issues earlier.",
    icon: "Ambulance",
    link: { label: "Explore our services", href: "/services" },
  },
  {
    id: "today",
    year: "Today",
    title: "50,000+ families, one connected network",
    description:
      "Six departments, in-person and online consultations, and a care team that knows our patients by name, not just a chart number.",
    icon: "ShieldCheck",
    link: { label: "Meet our doctors", href: "/doctors" },
  },
];
