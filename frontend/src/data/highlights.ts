export interface HighlightSectionData {
  id: string;
  eyebrow: string;
  /** Icon registry key (see components/ui/Icon.tsx). */
  icon: string;
  /** Photo for the large gallery panel. */
  image: string;
  /** Icon keys for the two small illustration panels beside the main one. */
  accentIcons: [string, string];
  title: string;
  description: string;
  points: string[];
  imagePosition: "left" | "right";
}

/** Powers the alternating gallery + checklist sections on the About page. */
export const highlightSections: HighlightSectionData[] = [
  {
    id: "care-team",
    eyebrow: "Why Patients Choose Us",
    icon: "HeartHandshake",
    image: "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=1200&q=80",
    accentIcons: ["Cross", "Stethoscope"],
    title: "Care built around trust, not just treatment",
    description:
      "Every visit is backed by the people, tools, and standards that make a hospital worth trusting with your family's health.",
    points: [
      "Experienced Medical Professionals",
      "Modern Medical Equipment",
      "24/7 Patient Support",
      "Personalized Treatment Plans",
    ],
    imagePosition: "left",
  },
  {
    id: "comfort-tech",
    eyebrow: "Designed For Your Comfort",
    icon: "Hospital",
    image: "https://images.unsplash.com/photo-1778151270902-cb0ca572f2ee?auto=format&fit=crop&w=1200&q=80",
    accentIcons: ["Syringe", "ShieldCheck"],
    title: "Modern facilities, made for real recovery",
    description:
      "From the waiting room to the recovery ward, every space is designed around patient comfort and clear communication.",
    points: [
      "Digital Health Records & Patient Portal",
      "Comfortable Private Recovery Rooms",
      "Multilingual Care Coordinators",
      "On-Site Pharmacy & Diagnostic Labs",
    ],
    imagePosition: "right",
  },
];
