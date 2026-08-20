import type { BlinkAccordionItem } from "@/components/ui/BlinkAccordion";

/** Powers the "In This Section" accordion on the About page. */
export const inThisSection: BlinkAccordionItem[] = [
  {
    id: "story",
    title: "Our Story",
    description:
      "See how NIVREN grew from a single clinic into a connected network of hospitals over two decades.",
    link: { label: "View Our Timeline", href: "/about#our-journey" },
  },
  {
    id: "billing",
    title: "Insurance & Billing",
    description:
      "Transparent pricing and dedicated revenue-cycle support, so you always know what to expect before your visit.",
    link: { label: "View RCM Services", href: "/rcm" },
  },
  {
    id: "resources",
    title: "Patient Resources",
    description: "Accessibility support, visit preparation, and answers to the questions patients ask us most.",
    link: { label: "View Resources", href: "/accessibility" },
  },
  {
    id: "locations",
    title: "Locations & Hours",
    description:
      "Find the NIVREN facility closest to you, with hours, directions, and emergency availability.",
    link: { label: "View Locations", href: "/locations" },
  },
];
