export interface CaseStudy {
  id: string;
  client: string;
  clientType: string;
  challenge: string;
  approach: string;
  result: { value: string; label: string };
}

/** Illustrative case studies — fictional client names, not real organizations. */
export const caseStudies: CaseStudy[] = [
  {
    id: "sunrise",
    client: "Sunrise Multispecialty Clinic",
    clientType: "Physician Group, 12 providers",
    challenge: "Denial rate had crept up to nearly 1 in 5 claims, with no consistent process to track why claims were failing.",
    approach: "Root-cause denial analysis by category and payer, paired with upstream coding fixes so the same denial reason stopped recurring.",
    result: { value: "-48%", label: "Denial rate, two quarters" },
  },
  {
    id: "lakeside",
    client: "Lakeside Health Group",
    clientType: "Multi-location health system",
    challenge: "Coding gaps from a previous vendor were quietly undercoding complex procedures across several departments.",
    approach: "Full coding audit followed by specialty-certified coders reassigned per department, with monthly accuracy reviews.",
    result: { value: "+99.1%", label: "Coding accuracy, first month" },
  },
  {
    id: "cascade",
    client: "Cascade Orthopedic Partners",
    clientType: "Orthopedic specialty practice",
    challenge: "Switching RCM vendors risked a cash-flow gap during transition, with claims stuck mid-process.",
    approach: "Phased onboarding — claims and workflow audit first, then coding, billing, and follow-up brought over in sequence.",
    result: { value: "< 3 weeks", label: "Full transition, zero disruption" },
  },
];
