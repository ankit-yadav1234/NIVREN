import type { FAQ } from "@/types";

export const faqs: FAQ[] = [
  {
    id: "faq-onboarding",
    question: "How quickly can we onboard with your RCM team?",
    answer:
      "Most practices are fully transitioned within 2–3 weeks. We start with a claims and workflow audit, then phase in coding, billing, and follow-up so nothing falls through during the switch.",
    category: "Onboarding",
  },
  {
    id: "faq-software",
    question: "Do you work with our existing practice management software?",
    answer:
      "Yes — our team works within your current PM/EHR system rather than asking you to migrate. We adapt to your setup, not the other way around.",
    category: "Onboarding",
  },
  {
    id: "faq-modular",
    question: "Can we start with just one service, like coding or AR follow-up?",
    answer: "Yes — our RCM services are modular. Many practices start with a single service and expand once they see the results.",
    category: "Services",
  },
  {
    id: "faq-denials",
    question: "What happens when a claim gets denied?",
    answer:
      "Every denial gets a root-cause review, not just a resubmission. We track denial categories over time so the same issue doesn't keep recurring quarter after quarter.",
    category: "Services",
  },
  {
    id: "faq-specialties",
    question: "Do you have experience with our specialty?",
    answer:
      "We bring deep coding and billing expertise across cardiology, neurology, orthopedics, pediatrics, oncology, and dermatology — proven first on our own hospital network before we offer it to other providers.",
    category: "Services",
  },
  {
    id: "faq-security",
    question: "Is our patient data secure and HIPAA-compliant?",
    answer: "All workflows run through HIPAA-compliant, encrypted systems, with access limited to the staff directly handling your account.",
    category: "Compliance",
  },
  {
    id: "faq-billing",
    question: "How does NIVREN charge for its services?",
    answer:
      "Pricing depends on which services you need and your claims volume. Request a free revenue cycle assessment through the Contact page and we'll walk you through what a partnership would look like.",
    category: "Pricing",
  },
];
