import type { RcmService } from "@/types";

export const rcmServices: RcmService[] = [
  {
    id: "medical-billing",
    slug: "medical-billing",
    title: "End-to-End Medical Billing",
    tagline: "Get paid faster with fewer errors",
    description:
      "We manage the complete billing lifecycle — from charge capture to final payment — so your practice collects more, faster, with full transparency at every step.",
    icon: "Receipt",
    benefits: [
      "Charge capture and clean-claim submission",
      "Reduced billing errors and rework",
      "Faster reimbursement cycles",
      "Transparent, real-time reporting",
      "HIPAA-compliant workflows",
    ],
    process: [
      { title: "Capture", description: "Charges are captured and validated against payer rules." },
      { title: "Submit", description: "Clean claims are scrubbed and submitted electronically." },
      { title: "Reconcile", description: "Payments are posted and variances are worked to zero." },
    ],
    stat: { value: "98%", label: "Clean claim rate" },
  },
  {
    id: "medical-coding",
    slug: "medical-coding",
    title: "Certified Medical Coding",
    tagline: "Accurate ICD-10, CPT & HCPCS coding",
    description:
      "AAPC/AHIMA-certified coders assign precise codes for every encounter, maximizing compliant reimbursement while minimizing audit and denial risk.",
    icon: "ClipboardList",
    benefits: [
      "Specialty-specific certified coders",
      "ICD-10-CM, CPT and HCPCS accuracy",
      "Compliance with payer and CMS guidelines",
      "Regular coding audits and feedback",
      "Reduced coding-related denials",
    ],
    process: [
      { title: "Review", description: "Clinical documentation is reviewed for completeness." },
      { title: "Assign", description: "Codes are assigned and cross-checked for accuracy." },
      { title: "Audit", description: "Random audits ensure ongoing compliance." },
    ],
    stat: { value: "99.2%", label: "Coding accuracy" },
  },
  {
    id: "eligibility-verification",
    slug: "eligibility-verification",
    title: "Eligibility & Benefits Verification",
    tagline: "Stop denials before they start",
    description:
      "We verify insurance eligibility and benefits before the visit, so patients understand their responsibility and claims aren't denied for coverage issues.",
    icon: "ShieldCheck",
    benefits: [
      "Real-time eligibility checks (270/271)",
      "Coverage, co-pay and deductible details",
      "Prior-authorization flagging",
      "Fewer front-end denials",
      "Better patient financial experience",
    ],
    process: [
      { title: "Verify", description: "Coverage is confirmed with the payer before the visit." },
      { title: "Estimate", description: "Patient responsibility is calculated up front." },
      { title: "Notify", description: "Staff and patients are informed of any gaps." },
    ],
    stat: { value: "-35%", label: "Front-end denials" },
  },
  {
    id: "claims-management",
    slug: "claims-management",
    title: "Claims Submission & Scrubbing",
    tagline: "Clean claims, first time",
    description:
      "Every claim passes through automated scrubbing and manual review before submission, catching errors early to accelerate first-pass acceptance.",
    icon: "FileCheck",
    benefits: [
      "Automated + manual claim scrubbing",
      "Electronic submission to all major payers",
      "Real-time rejection tracking",
      "Higher first-pass acceptance",
      "Faster payer turnaround",
    ],
    process: [
      { title: "Scrub", description: "Claims are validated against thousands of payer edits." },
      { title: "Submit", description: "Clean claims are transmitted electronically." },
      { title: "Track", description: "Acknowledgements and rejections are monitored daily." },
    ],
    stat: { value: "< 24h", label: "Submission turnaround" },
  },
  {
    id: "denial-management",
    slug: "denial-management",
    title: "Denial Management & Appeals",
    tagline: "Recover every dollar you've earned",
    description:
      "We analyze denial root causes, appeal aggressively, and fix upstream issues so the same denials don't happen again — protecting your revenue.",
    icon: "RefreshCw",
    benefits: [
      "Root-cause denial analysis",
      "Timely, evidence-backed appeals",
      "Trend reporting to prevent recurrence",
      "Payer-specific appeal strategies",
      "Measurable recovery rates",
    ],
    process: [
      { title: "Analyze", description: "Denials are categorized by reason and payer." },
      { title: "Appeal", description: "Appeals are filed with supporting documentation." },
      { title: "Prevent", description: "Findings feed back to stop future denials." },
    ],
    stat: { value: "92%", label: "Appeal success rate" },
  },
  {
    id: "ar-management",
    slug: "ar-management",
    title: "Accounts Receivable Follow-up",
    tagline: "Shrink your aging buckets",
    description:
      "Our AR specialists systematically work aged claims, follow up with payers, and resolve underpayments to keep your days-in-AR low and cash flow steady.",
    icon: "Wallet",
    benefits: [
      "Prioritized aging-bucket workflows",
      "Persistent payer follow-up",
      "Underpayment identification",
      "Lower days in AR",
      "Improved, predictable cash flow",
    ],
    process: [
      { title: "Prioritize", description: "Claims are worked by value and aging." },
      { title: "Pursue", description: "Payers are contacted until claims resolve." },
      { title: "Resolve", description: "Underpayments and short-pays are recovered." },
    ],
    stat: { value: "28 days", label: "Average days in AR" },
  },
  {
    id: "credentialing",
    slug: "credentialing",
    title: "Provider Credentialing & Enrollment",
    tagline: "Start billing sooner",
    description:
      "We handle payer enrollment, CAQH maintenance, and re-credentialing end to end, so your providers are in-network and billable without delays.",
    icon: "BadgeCheck",
    benefits: [
      "Payer enrollment & re-credentialing",
      "CAQH profile setup and upkeep",
      "Application tracking to approval",
      "Fewer enrollment-related denials",
      "Faster time to first claim",
    ],
    process: [
      { title: "Prepare", description: "Provider data and documents are gathered." },
      { title: "Submit", description: "Applications are filed and tracked with payers." },
      { title: "Maintain", description: "Profiles and re-credentialing stay current." },
    ],
    stat: { value: "60→30", label: "Days to enrollment" },
  },
  {
    id: "rcm-analytics",
    slug: "rcm-analytics",
    title: "RCM Analytics & Reporting",
    tagline: "See your revenue clearly",
    description:
      "Custom dashboards and KPI reporting give you full visibility into collections, denials, AR, and payer performance — so you can make confident decisions.",
    icon: "BarChart3",
    benefits: [
      "Real-time collections & AR dashboards",
      "Denial and payer trend analysis",
      "Custom KPI reporting",
      "Benchmarking against targets",
      "Actionable revenue insights",
    ],
    process: [
      { title: "Collect", description: "Data is aggregated across your revenue cycle." },
      { title: "Visualize", description: "KPIs are surfaced in clear dashboards." },
      { title: "Act", description: "Insights drive targeted improvements." },
    ],
    stat: { value: "360°", label: "Revenue visibility" },
  },
];
