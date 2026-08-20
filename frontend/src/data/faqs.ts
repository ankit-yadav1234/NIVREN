import type { FAQ } from "@/types";

export const faqs: FAQ[] = [
  {
    id: "faq-1",
    question: "How do I book an appointment?",
    answer:
      "You can book online through our appointment page, call our helpline, or visit any of our locations in person.",
    category: "Appointments",
  },
  {
    id: "faq-2",
    question: "Do you accept insurance?",
    answer:
      "Yes, we work with most major insurance providers. Please check our insurance section or contact us to confirm your plan.",
    category: "Billing",
  },
  {
    id: "faq-3",
    question: "Are online consultations available?",
    answer:
      "Many of our doctors offer online consultations. Look for the online consultation badge on each doctor's profile.",
    category: "Consultations",
  },
  {
    id: "faq-4",
    question: "What should I bring to my first visit?",
    answer:
      "Please bring a valid photo ID, your insurance card if applicable, and any previous medical records or test results.",
    category: "Visits",
  },
  {
    id: "faq-5",
    question: "Is emergency care available 24/7?",
    answer:
      "Yes. Our emergency departments at select locations operate 24 hours a day, every day of the year.",
    category: "Emergency",
  },
];
