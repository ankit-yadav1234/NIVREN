/**
 * RAG knowledge base — the facts the assistant can answer questions about.
 * Kept as short, independent documents (per-specialty, per-service, per-FAQ)
 * so retrieval returns focused context instead of one giant blob.
 */
export interface KnowledgeDoc {
  id: string;
  text: string;
  route: string;
  category: string;
}

export const knowledgeBase: KnowledgeDoc[] = [
  {
    id: "company-overview",
    text:
      "NIVREN is a Revenue Cycle Management (RCM) company — billing, coding, denial management, AR " +
      "follow-up, credentialing, and analytics for hospitals and clinics. NIVREN also runs its own " +
      "connected hospital network (cardiology, neurology, orthopedics, pediatrics, oncology, " +
      "dermatology), which is where its RCM expertise is proven before it's offered to other providers.",
    route: "/about",
    category: "Company",
  },
  {
    id: "rcm-billing",
    text: "Medical Billing service: end-to-end claim submission and payment posting for hospitals and clinics.",
    route: "/rcm/medical-billing",
    category: "RCM",
  },
  {
    id: "rcm-coding",
    text: "Medical Coding service: certified coders assign accurate CPT/ICD codes to prevent undercoding and denials.",
    route: "/rcm/medical-coding",
    category: "RCM",
  },
  {
    id: "rcm-eligibility",
    text: "Eligibility Verification service: confirms patient insurance coverage before the visit to avoid claim rejections.",
    route: "/rcm/eligibility-verification",
    category: "RCM",
  },
  {
    id: "rcm-claims",
    text: "Claims Submission & Scrubbing service: automated and manual claim scrubbing before submission for a higher first-pass acceptance rate.",
    route: "/rcm/claims-management",
    category: "RCM",
  },
  {
    id: "rcm-denials",
    text:
      "Denial Management service: every denied claim gets a root-cause review and appeal, with a 92% appeal " +
      "success rate, so the same denial reason doesn't keep recurring.",
    route: "/rcm/denial-management",
    category: "RCM",
  },
  {
    id: "rcm-ar",
    text: "AR Follow-Up service: persistent follow-up with payers on unpaid claims to shorten days in accounts receivable — 28 days average.",
    route: "/rcm/ar-management",
    category: "RCM",
  },
  {
    id: "rcm-credentialing",
    text: "Provider Credentialing & Enrollment service: payer enrollment, CAQH maintenance, and re-credentialing, cutting time to first claim from ~60 to ~30 days.",
    route: "/rcm/credentialing",
    category: "RCM",
  },
  {
    id: "rcm-analytics",
    text: "RCM Analytics & Reporting service: real-time dashboards for collections, denials, AR, and payer performance.",
    route: "/rcm/rcm-analytics",
    category: "RCM",
  },
  {
    id: "rcm-stats",
    text: "RCM results: 98% clean claim rate, 28 average days in AR, 35% fewer denials, 99.1% coding accuracy, 24/7 dedicated support.",
    route: "/rcm",
    category: "RCM",
  },
  {
    id: "specialty-cardiology",
    text: "Cardiology billing & coding: correctly capturing complex CPT codes for interventional procedures, device implants, and cath lab work — a common source of undercoding elsewhere.",
    route: "/departments/cardiology",
    category: "Specialties",
  },
  {
    id: "specialty-neurology",
    text: "Neurology billing & coding: accurate coding for stroke care, EEG/EMG studies, and complex neurological procedures.",
    route: "/departments/neurology",
    category: "Specialties",
  },
  {
    id: "specialty-orthopedics",
    text: "Orthopedics billing & coding: precise coding for joint replacements, sports medicine procedures, and bundled-payment episodes.",
    route: "/departments/orthopedics",
    category: "Specialties",
  },
  {
    id: "specialty-pediatrics",
    text: "Pediatrics billing & coding: coding for well-child visits, vaccinations, and NICU care, with the age- and weight-based rules payers require.",
    route: "/departments/pediatrics",
    category: "Specialties",
  },
  {
    id: "specialty-oncology",
    text: "Oncology billing & coding: chemotherapy and radiation therapy coding, plus prior-authorization management for high-cost treatment plans.",
    route: "/departments/oncology",
    category: "Specialties",
  },
  {
    id: "specialty-dermatology",
    text: "Dermatology billing & coding: correctly distinguishing medical, surgical, and cosmetic procedures — a frequent denial trigger when miscoded.",
    route: "/departments/dermatology",
    category: "Specialties",
  },
  {
    id: "who-we-serve",
    text:
      "NIVREN serves hospitals and health systems, physician groups, independent clinics and medical " +
      "practices, and other healthcare organizations like ambulatory surgery centers and behavioral " +
      "health providers — RCM support sized to how each one actually operates.",
    route: "/who-we-serve",
    category: "Company",
  },
  {
    id: "case-studies",
    text:
      "Client results include a 48% denial rate reduction in two quarters, 99.1% coding accuracy from " +
      "the first month, and a full RCM transition completed in under 3 weeks with zero disruption to " +
      "cash flow. Full case studies are on the Case Studies page.",
    route: "/case-studies",
    category: "Company",
  },
  {
    id: "leadership",
    text: "NIVREN's leadership team includes the CEO, VP of Revenue Cycle Operations, Head of Compliance & Security, and Director of Client Success.",
    route: "/about/leadership",
    category: "Company",
  },
  {
    id: "careers",
    text: "NIVREN hires certified coders, billers, and RCM specialists, mostly remote-first roles. Open interest can be sent through the Contact page even without a specific open role.",
    route: "/about/careers",
    category: "Company",
  },
  {
    id: "faq-consultation",
    text: "How to get started: request a free revenue cycle assessment through the Contact page, or ask the assistant to open it. A specialist follows up to review your current billing setup.",
    route: "/contact",
    category: "FAQ",
  },
  {
    id: "faq-onboarding",
    text: "Onboarding: most practices are fully transitioned within 2-3 weeks. NIVREN works within your existing practice management/EHR system rather than requiring a migration.",
    route: "/rcm",
    category: "FAQ",
  },
  {
    id: "faq-security",
    text: "Data security: all workflows run through HIPAA-compliant, encrypted systems, with access limited to the staff directly handling your account.",
    route: "/rcm",
    category: "FAQ",
  },
];
