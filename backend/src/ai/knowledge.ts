/**
 * RAG knowledge base — the facts the assistant can answer questions about.
 * Kept as short, independent documents (per-specialty, per-service, per-FAQ, per-policy)
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
      "NIVREN is an advanced Healthcare Revenue Cycle Management (RCM) and Medical Billing partner. " +
      "We help physician practices, clinics, specialty groups, and hospital networks eliminate claim denials, " +
      "streamline certified medical coding, accelerate accounts receivable recovery, and maximize total practice collections.",
    route: "/about",
    category: "Company",
  },
  {
    id: "rcm-billing",
    text: "Medical Billing service: end-to-end electronic claim submission, payment posting, secondary billing, and patient statement processing for healthcare providers.",
    route: "/rcm/medical-billing",
    category: "RCM",
  },
  {
    id: "rcm-coding",
    text: "Certified Medical Coding service: AAPC/AHIMA certified coders assign precise CPT, ICD-10, and HCPCS codes with 99.1% accuracy to eliminate undercoding and audits.",
    route: "/rcm/medical-coding",
    category: "RCM",
  },
  {
    id: "rcm-eligibility",
    text: "Eligibility & Benefits Verification service: 24-48 hr advance verification of patient insurance coverage, co-pays, deductibles, and prior-authorization needs to eliminate front-end rejections.",
    route: "/rcm/eligibility-verification",
    category: "RCM",
  },
  {
    id: "rcm-claims",
    text: "Claims Management & Scrubbing service: multi-tier automated scrubbing rules before submission, delivering a 98% first-pass clean claim acceptance rate.",
    route: "/rcm/claims-management",
    category: "RCM",
  },
  {
    id: "rcm-denials",
    text:
      "Denial Management & Appeals service: comprehensive root-cause analysis on every denied claim, rapid appeals with a 92% recovery success rate, and systematic prevention.",
    route: "/rcm/denial-management",
    category: "RCM",
  },
  {
    id: "rcm-ar",
    text: "Accounts Receivable (AR) Recovery service: aggressive payer follow-up on aging 30/60/90/120+ day balances, reducing average days in AR to 28 days (industry average is 45-55 days).",
    route: "/rcm/ar-management",
    category: "RCM",
  },
  {
    id: "rcm-credentialing",
    text: "Provider Credentialing & Payer Enrollment service: full enrollment management, CAQH profile maintenance, and re-credentialing, cutting provider start time from 60 to 30 days.",
    route: "/rcm/credentialing",
    category: "RCM",
  },
  {
    id: "rcm-analytics",
    text: "RCM Analytics & Financial Reporting: executive BI dashboards tracking net collection rate, denial breakdown, payer turnaround time, and provider productivity.",
    route: "/rcm/rcm-analytics",
    category: "RCM",
  },
  {
    id: "rcm-stats",
    text: "NIVREN core performance metrics: 98% first-pass clean claim rate, 28 average days in AR, 35% reduction in claim denials, 99.1% coding accuracy, and 24/7 client support.",
    route: "/rcm",
    category: "RCM",
  },
  {
    id: "legal-privacy-policy",
    text:
      "Privacy Policy & HIPAA Compliance: NIVREN is 100% HIPAA compliant and SOC 2 Type II certified. All Protected Health Information (PHI) and patient financial records are encrypted using AES-256 at rest and TLS 1.3 in transit. We sign Business Associate Agreements (BAAs), implement strict role-based access control, and NEVER sell or share private patient data with unauthorized third parties.",
    route: "/privacy",
    category: "Legal",
  },
  {
    id: "legal-terms-of-service",
    text:
      "Terms of Service: Our agreements govern RCM consulting, billing management, and software portal access. NIVREN operates on transparent performance-based fee structures, standard 99.9% uptime SLAs, clear dispute resolution protocols, and strict client data ownership protections.",
    route: "/terms",
    category: "Legal",
  },
  {
    id: "legal-medical-disclaimer",
    text:
      "Medical Disclaimer: The information provided on this website and by the AI assistant is for healthcare revenue cycle management, billing, and operational purposes only. NIVREN does not provide direct medical diagnosis or clinical treatment. Patients must always consult licensed physicians for medical emergencies and clinical care.",
    route: "/disclaimer",
    category: "Legal",
  },
  {
    id: "legal-accessibility",
    text:
      "Accessibility Statement: NIVREN is committed to digital accessibility complying with WCAG 2.1 Level AA standards. The platform supports screen readers, keyboard navigation, fluid clamp typography, high-contrast healthcare color tokens, and reduced-motion user preferences.",
    route: "/accessibility",
    category: "Legal",
  },
  {
    id: "who-we-serve",
    text:
      "Who We Serve: Independent physician practices, multi-specialty clinics, ambulatory surgery centers (ASCs), hospital networks, behavioral health centers, and diagnostic labs across the United States.",
    route: "/who-we-serve",
    category: "Company",
  },
  {
    id: "case-studies",
    text:
      "Case Studies & Proven Results: Multi-specialty clinic achieved a 48% denial rate reduction in 6 months; surgical group accelerated cash collections by $1.2M in 90 days; cardiology practice achieved 99.2% coding accuracy with zero transition downtime.",
    route: "/case-studies",
    category: "Company",
  },
  {
    id: "leadership",
    text: "Leadership: Led by executive healthcare administrators, former hospital CFOs, certified billing directors, and health-tech engineers dedicated to revenue integrity.",
    route: "/about/leadership",
    category: "Company",
  },
  {
    id: "careers",
    text: "Careers: NIVREN hires remote-first certified medical coders (CPC, COC, CIC), billing specialists, denial managers, and client success leads. Comprehensive benefits, competitive compensation, and ongoing CEU support are provided.",
    route: "/about/careers",
    category: "Company",
  },
  {
    id: "locations-contact",
    text: "Locations & Contact: Headquarters: 100 Healthcare Plaza, Suite 400. Regional operations in Downtown, Westside, and Eastgate centers. Phone: +1 (800) 555-0199 / +91 98765 43210 | Email: care@nivren.example.",
    route: "/locations",
    category: "Contact",
  },
  {
    id: "faq-consultation",
    text: "Consultation & Free Practice Assessment: Providers can book a free, zero-obligation Revenue Cycle Assessment and Claims Audit. Required details: Name, Phone number, Email address, and Service needed.",
    route: "/contact",
    category: "FAQ",
  },
  {
    id: "faq-onboarding",
    text: "Onboarding & EHR Integration: Seamless 2-3 week transition with zero cash flow disruption. NIVREN integrates directly into your existing EHR/PM system (Epic, Cerner, AthenaHealth, eClinicalWorks, Kareo, NextGen, etc.).",
    route: "/faq",
    category: "FAQ",
  },
  {
    id: "faq-pricing",
    text: "Pricing Model: Performance-aligned percentage of collections model. We only succeed when your practice collects revenue. No hidden software fees or locked contracts.",
    route: "/faq",
    category: "FAQ",
  },
];
