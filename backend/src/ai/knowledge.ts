/**
 * RAG knowledge base — the facts the assistant can answer questions about.
 * Kept as short, independent documents (per-department, per-service, per-FAQ)
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
      "NIVREN runs a connected hospital network (cardiology, neurology, orthopedics, pediatrics, " +
      "oncology, dermatology) and also provides Revenue Cycle Management (RCM) services — billing, " +
      "coding, denial management, AR follow-up, credentialing, and analytics — to other healthcare " +
      "organizations.",
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
    id: "rcm-denials",
    text:
      "Denial Management service: every denied claim gets a root-cause review and appeal, with a 95%+ appeal " +
      "success rate, so the same denial reason doesn't keep recurring.",
    route: "/rcm",
    category: "RCM",
  },
  {
    id: "rcm-ar",
    text: "AR Follow-Up service: persistent follow-up with payers on unpaid claims to shorten days in accounts receivable.",
    route: "/rcm",
    category: "RCM",
  },
  {
    id: "rcm-stats",
    text: "RCM results: 98% clean claim rate, 28 average days in AR, 35% fewer denials, 24/7 dedicated support.",
    route: "/rcm",
    category: "RCM",
  },
  {
    id: "dept-cardiology",
    text: "Cardiology department: heart care from preventive screening to advanced interventional procedures, 24/7 cardiac emergency, cath lab.",
    route: "/departments/cardiology",
    category: "Departments",
  },
  {
    id: "dept-neurology",
    text: "Neurology department: diagnosis and treatment of brain, spine, and nervous system disorders, stroke unit, epilepsy care.",
    route: "/departments/neurology",
    category: "Departments",
  },
  {
    id: "dept-orthopedics",
    text: "Orthopedics department: bone, joint, and muscle care including joint replacement and sports medicine.",
    route: "/departments/orthopedics",
    category: "Departments",
  },
  {
    id: "dept-pediatrics",
    text: "Pediatrics department: care for infants, children, and adolescents, including a neonatal ICU and vaccinations.",
    route: "/departments/pediatrics",
    category: "Departments",
  },
  {
    id: "dept-oncology",
    text: "Oncology department: multidisciplinary cancer care including chemotherapy, radiation therapy, and palliative care.",
    route: "/departments/oncology",
    category: "Departments",
  },
  {
    id: "dept-dermatology",
    text: "Dermatology department: medical, surgical, and cosmetic skin, hair, and nail care.",
    route: "/departments/dermatology",
    category: "Departments",
  },
  {
    id: "faq-booking",
    text: "How to book an appointment: online through the appointment page, by calling the helpline, or in person at any location.",
    route: "/appointment",
    category: "FAQ",
  },
  {
    id: "faq-insurance",
    text: "Insurance: NIVREN works with most major insurance providers — check the insurance section or contact the team to confirm a specific plan.",
    route: "/contact",
    category: "FAQ",
  },
  {
    id: "faq-online-consult",
    text: "Online consultations are available with select doctors — filter by consultation type on the Doctors page.",
    route: "/doctors",
    category: "FAQ",
  },
];
