export interface ServeSegment {
  id: string;
  icon: string;
  title: string;
  description: string;
  points: string[];
}

export const whoWeServe: ServeSegment[] = [
  {
    id: "hospitals",
    icon: "Hospital",
    title: "Hospitals & Health Systems",
    description:
      "High-volume, multi-department billing with the coordination a hospital's revenue cycle actually needs.",
    points: [
      "Multi-specialty coding across every department",
      "Enterprise-scale claims volume without dropped follow-up",
      "Payer contract and denial trend visibility system-wide",
    ],
  },
  {
    id: "physician-groups",
    icon: "Stethoscope",
    title: "Physician Groups",
    description: "Modular RCM support that scales with a growing group practice, without the overhead of an in-house billing team.",
    points: [
      "Credentialing for new providers as you add them",
      "Consistent coding standards across every location",
      "One point of contact instead of a billing office to manage",
    ],
  },
  {
    id: "clinics",
    icon: "ClipboardCheck",
    title: "Clinics & Medical Practices",
    description: "Right-sized RCM for independent and small-to-mid practices that need clean claims and steady cash flow, not enterprise overhead.",
    points: [
      "Fast onboarding — most practices in 2–3 weeks",
      "Works inside your existing PM/EHR, no migration",
      "Start with one service and expand as it proves out",
    ],
  },
  {
    id: "healthcare-orgs",
    icon: "Activity",
    title: "Healthcare Organizations",
    description: "Ambulatory surgery centers, behavioral health, and specialty organizations with billing needs that don't fit a generic template.",
    points: [
      "Specialty-specific coding expertise, not one-size-fits-all",
      "Prior-authorization handling for high-cost procedures",
      "Reporting built around your actual KPIs",
    ],
  },
];
