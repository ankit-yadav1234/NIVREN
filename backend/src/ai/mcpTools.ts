/**
 * ============================================================================
 * NIVREN HEALTHCARE MCP (MODEL CONTEXT PROTOCOL) LIVE TOOLS & DECISION ENGINE
 * ============================================================================
 * Pure, self-contained algorithms and lookup engines for real-time practice
 * financial calculations, EHR integrations, and specialty benchmark analysis.
 */

export interface RoiCalculationResult {
  monthlyBilling: number;
  currentDenialRate: number; // e.g. 10% (0.10)
  projectedDenialRate: number; // NIVREN standard 2% (0.02)
  monthlyLoss: number;
  monthlyRecovered: number;
  annualAdditionalRevenue: number;
  arDaysSaved: number;
  currency: string;
}

/**
 * Calculates real-time financial ROI and lost revenue recovery for a practice
 * based on their monthly billing volume and estimated claim denial rate.
 */
export function calculateRcmRoi(
  monthlyBilling: number,
  denialRatePercent: number = 10,
  currency: string = "INR"
): RoiCalculationResult {
  const normalizedBilling = Math.max(10000, Number(monthlyBilling) || 500000);
  const currentRate = Math.min(50, Math.max(2, Number(denialRatePercent) || 10)) / 100;
  const targetRate = 0.02; // NIVREN 98% clean claim benchmark

  // Current monthly revenue lost to claim denials
  const monthlyLoss = Math.round(normalizedBilling * currentRate);
  // Revenue recovered by bringing denials down from currentRate to 2%
  const rateDiff = Math.max(0, currentRate - targetRate);
  const monthlyRecovered = Math.round(normalizedBilling * rateDiff);
  const annualAdditionalRevenue = monthlyRecovered * 12;
  const arDaysSaved = 22; // 50 days industry avg -> 28 days NIVREN avg

  return {
    monthlyBilling: normalizedBilling,
    currentDenialRate: Math.round(currentRate * 100),
    projectedDenialRate: 2,
    monthlyLoss,
    monthlyRecovered,
    annualAdditionalRevenue,
    arDaysSaved,
    currency,
  };
}

export interface EhrCompatibilityResult {
  ehrName: string;
  isSupported: boolean;
  integrationType: "DIRECT_API" | "HL7_FHIR" | "SFTP_BATCH" | "WEB_PORTAL";
  setupTimeDays: number;
  features: string[];
  notes: string;
}

const EHR_DATABASE: Record<string, EhrCompatibilityResult> = {
  epic: {
    ehrName: "Epic Systems",
    isSupported: true,
    integrationType: "DIRECT_API",
    setupTimeDays: 7,
    features: ["Real-time Eligibility Check", "Automated Charge Capture", "Bi-directional Remittance Posting", "Clinical Note Pulling"],
    notes: "Full bi-directional FHIR API integration with zero workflow changes for clinical staff.",
  },
  cerner: {
    ehrName: "Oracle Cerner",
    isSupported: true,
    integrationType: "DIRECT_API",
    setupTimeDays: 7,
    features: ["Automated Charge Ingestion", "Denial Code Tagging", "Electronic Remittance Posting"],
    notes: "Direct integration via Oracle Health Millennium APIs.",
  },
  athenahealth: {
    ehrName: "AthenaHealth",
    isSupported: true,
    integrationType: "DIRECT_API",
    setupTimeDays: 3,
    features: ["AthenaOne Cloud Sync", "Real-time Scrubbing", "Direct Payer Rule Sync"],
    notes: "Instant cloud connector with seamless API webhook synchronization.",
  },
  eclinicalworks: {
    ehrName: "eClinicalWorks (eCW)",
    isSupported: true,
    integrationType: "DIRECT_API",
    setupTimeDays: 5,
    features: ["eBO Financial Analytics", "Fee Schedule Sync", "EDI 837/835 Stream"],
    notes: "Certified eClinicalWorks developer partner with automated claim batching.",
  },
  kareo: {
    ehrName: "Kareo / Tebra",
    isSupported: true,
    integrationType: "DIRECT_API",
    setupTimeDays: 3,
    features: ["Patient Statement Automation", "Billing Dashboard", "Live Claim Tracking"],
    notes: "Direct Tebra API connector with 1-click credential handover.",
  },
  nextgen: {
    ehrName: "NextGen Healthcare",
    isSupported: true,
    integrationType: "DIRECT_API",
    setupTimeDays: 6,
    features: ["Multi-specialty Rule Engine", "Enterprise AR Queues", "Clearinghouse Direct Bridge"],
    notes: "Enterprise compatibility for ambulatory surgery centers and group practices.",
  },
  allscripts: {
    ehrName: "Veradigm (Allscripts)",
    isSupported: true,
    integrationType: "DIRECT_API",
    setupTimeDays: 5,
    features: ["TouchWorks Billing", "Professional PM Sync", "Charge Audit Bridge"],
    notes: "Certified Veradigm open API connectivity.",
  },
  practicefusion: {
    ehrName: "Practice Fusion",
    isSupported: true,
    integrationType: "HL7_FHIR",
    setupTimeDays: 4,
    features: ["Billing Export Integration", "Superbill Synchronization", "Payer Response Tracker"],
    notes: "Automated daily claim scrubbing bridge.",
  },
};

/**
 * Checks real-time EHR / PM software integration compatibility.
 */
export function checkEhrCompatibility(rawName: string): EhrCompatibilityResult {
  const query = rawName.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  for (const [key, info] of Object.entries(EHR_DATABASE)) {
    if (query.includes(key) || key.includes(query)) {
      return info;
    }
  }

  // Generic supported EHR fallback
  return {
    ehrName: rawName.trim() || "Custom / Web-based PM",
    isSupported: true,
    integrationType: "HL7_FHIR",
    setupTimeDays: 10,
    features: ["Universal HL7/FHIR Data Ingestion", "EDI 837/835 Gateway", "Manual Superbill Bridge"],
    notes: "NIVREN supports all standard HIPAA-compliant EHRs with zero software replacement required.",
  };
}

export interface SpecialtyBenchmarkResult {
  specialty: string;
  industryDenialRate: string;
  nivrenCleanRate: string;
  averageArDays: number;
  topDenialReason: string;
  bestPracticeTip: string;
}

const SPECIALTY_BENCHMARKS: Record<string, SpecialtyBenchmarkResult> = {
  cardiology: {
    specialty: "Cardiology",
    industryDenialRate: "14.8%",
    nivrenCleanRate: "98.7%",
    averageArDays: 26,
    topDenialReason: "Missing pre-authorization on device implants and unbundled cath-lab CPT modifiers.",
    bestPracticeTip: "Pre-service authorization checks and interventional modifier scrubbing eliminate 94% of denials.",
  },
  neurology: {
    specialty: "Neurology",
    industryDenialRate: "13.2%",
    nivrenCleanRate: "98.4%",
    averageArDays: 27,
    topDenialReason: "Lack of clinical necessity documentation on prolonged EEG monitoring.",
    bestPracticeTip: "Pairing neuro-diagnostic CPT codes with precise ICD-10 seizure duration documentation.",
  },
  orthopedics: {
    specialty: "Orthopedics & Spine",
    industryDenialRate: "16.4%",
    nivrenCleanRate: "98.9%",
    averageArDays: 28,
    topDenialReason: "Global surgical period overlaps and bundled hardware implant denials.",
    bestPracticeTip: "Modifier 58/59/78 precision and distinct anatomical site tagging.",
  },
  pediatrics: {
    specialty: "Pediatrics",
    industryDenialRate: "9.5%",
    nivrenCleanRate: "99.1%",
    averageArDays: 24,
    topDenialReason: "V-code age mismatches and vaccine administration route errors.",
    bestPracticeTip: "Real-time state Medicaid vaccine code tables and preventive well-visit bundling.",
  },
  oncology: {
    specialty: "Oncology & Infusion",
    industryDenialRate: "18.5%",
    nivrenCleanRate: "98.2%",
    averageArDays: 31,
    topDenialReason: "High-cost J-code medication pre-auth expiration and wastage documentation.",
    bestPracticeTip: "Dedicated oncology pre-clearance and JW modifier waste tracking.",
  },
  general: {
    specialty: "Multi-Specialty & General Practice",
    industryDenialRate: "12.0%",
    nivrenCleanRate: "98.5%",
    averageArDays: 28,
    topDenialReason: "Front-end eligibility errors and timely filing limits.",
    bestPracticeTip: "24-hour advance eligibility verification and 3-tier automated claim scrubbing.",
  },
};

/**
 * Retrieves specialty financial benchmarks and denial prevention insights.
 */
export function getSpecialtyBenchmarks(rawSpecialty: string): SpecialtyBenchmarkResult {
  const query = rawSpecialty.toLowerCase();
  for (const [key, benchmark] of Object.entries(SPECIALTY_BENCHMARKS)) {
    if (query.includes(key)) return benchmark;
  }
  return SPECIALTY_BENCHMARKS.general;
}

export interface DenialCodeResult {
  code: string;
  name: string;
  category: "ELIGIBILITY" | "CODING_MODIFIER" | "MEDICAL_NECESSITY" | "TIMELY_FILING" | "BUNDLING";
  explanation: string;
  recoveryStrategy: string;
  requiredDocuments: string[];
  nivrenAppealSuccessRate: string;
}

const DENIAL_CODE_DATABASE: Record<string, DenialCodeResult> = {
  "co-16": {
    code: "CO-16",
    name: "Claim Lacks Required Information / Coding Defect",
    category: "CODING_MODIFIER",
    explanation: "Payer rejected claim due to missing or invalid data elements (e.g. invalid NPI, missing diagnosis pointer, incomplete referral ID, or unlisted CPT code).",
    recoveryStrategy: "Cross-reference ERA remark codes (RARC), correct diagnosis pointers, verify taxonomy code, and resubmit electronic 837P batch within 48 hours.",
    requiredDocuments: ["Corrected CMS-1500 / 837P batch", "Payer verification receipt"],
    nivrenAppealSuccessRate: "96%",
  },
  "co-4": {
    code: "CO-4",
    name: "Modifier Missing or Inconsistent with CPT Code",
    category: "CODING_MODIFIER",
    explanation: "The procedure code requires a specific anatomical or distinct procedural modifier (such as 25, 59, 78, 79, RT, LT) that was missing or improperly unbundled.",
    recoveryStrategy: "Audit clinical notes, append appropriate distinct procedural modifier (e.g. Modifier 25 for significant separate E/M or Modifier 59/XU for distinct service), and submit appeal.",
    requiredDocuments: ["Physician Operative Notes", "Signed Superbill", "CPT CCI Edit Verification"],
    nivrenAppealSuccessRate: "94%",
  },
  "co-50": {
    code: "CO-50",
    name: "Medical Necessity Denial",
    category: "MEDICAL_NECESSITY",
    explanation: "Payer determined the procedure or treatment was not medically necessary based on their clinical local coverage determinations (LCD) or national policy (NCD).",
    recoveryStrategy: "Draft a formal Level 1 appeal package citing peer-reviewed clinical guidelines, medical history, prior conservative treatments failed, and physician letter of medical necessity.",
    requiredDocuments: ["Letter of Medical Necessity (LMN)", "Complete Clinical Chart History", "Published Payer LCD / NCD Policy Guidelines"],
    nivrenAppealSuccessRate: "89%",
  },
  "co-97": {
    code: "CO-97",
    name: "Service Included in Payment / Allowance for Another Service (Bundled)",
    category: "BUNDLING",
    explanation: "Payer bundled this CPT code into a primary procedure under NCCI edit rules.",
    recoveryStrategy: "Verify if services were performed at separate anatomical sites or separate patient encounters. Append Modifier 59, XE, XP, XS, or XU with supporting operative documentation.",
    requiredDocuments: ["Operative Note highlighting separate anatomical sites", "NCCI Edit Rationale"],
    nivrenAppealSuccessRate: "92%",
  },
  "co-29": {
    code: "CO-29",
    name: "Timely Filing Limit Expired",
    category: "TIMELY_FILING",
    explanation: "The claim was received past the payer's mandated filing window (e.g., 90 days for commercial, 365 days for Medicare).",
    recoveryStrategy: "Submit Level 1 appeal with Electronic Data Interchange (EDI) Level 2/3 999/277 Acceptance Confirmation proving original clean batch submission prior to deadline.",
    requiredDocuments: ["EDI Clearinghouse Batch Acceptance Confirmation", "Payer Initial Acknowledgment Log"],
    nivrenAppealSuccessRate: "95%",
  },
  "pr-1": {
    code: "PR-1",
    name: "Patient Deductible Amount",
    category: "ELIGIBILITY",
    explanation: "Service is covered by insurance, but the balance was applied toward the patient's annual calendar-year deductible.",
    recoveryStrategy: "Automatically route balance to patient billing queue with transparent statement explanation and zero-interest payment plan options.",
    requiredDocuments: ["Patient Explanation of Benefits (EOB)", "Automated Patient Statement"],
    nivrenAppealSuccessRate: "98% Collectability",
  },
};

/**
 * Looks up CARC/RARC payer denial codes to give exact appeal strategies.
 */
export function lookupDenialCode(rawCode: string): DenialCodeResult {
  const query = rawCode.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, denial] of Object.entries(DENIAL_CODE_DATABASE)) {
    const cleanKey = key.replace(/[^a-z0-9]/g, "");
    if (query.includes(cleanKey) || cleanKey.includes(query)) {
      return denial;
    }
  }

  // Fallback for custom/unlisted denial codes
  return {
    code: rawCode.toUpperCase().trim() || "CO-GEN",
    name: `Payer Denial Code ${rawCode.toUpperCase()}`,
    category: "CODING_MODIFIER",
    explanation: "Payer remittance adjustment requiring root-cause CARC/RARC review and claim audit.",
    recoveryStrategy: "Perform end-to-end clinical note audit, check payer fee schedule and LCD coverage rules, and submit expedited Level 1 appeal package.",
    requiredDocuments: ["CMS-1500 / UB-04 Claim", "ERA Explanation of Benefits", "Clinical Chart Documentation"],
    nivrenAppealSuccessRate: "92%",
  };
}

export interface PracticeHealthResult {
  score: number; // 0 to 100
  grade: "A+" | "A" | "B" | "C" | "D";
  status: "EXCELLENT" | "HEALTHY" | "MODERATE_RISK" | "HIGH_LEAKAGE";
  denialRate: number;
  arDays: number;
  cleanClaimRate: number;
  annualLeakageEstimate: string;
  recommendations: string[];
}

/**
 * Computes a comprehensive practice revenue cycle health score (0-100).
 */
export function assessPracticeHealth(
  denialRatePercent: number = 10,
  arDays: number = 45,
  cleanClaimRatePercent: number = 88
): PracticeHealthResult {
  let score = 100;
  
  // Penalties for high denials (benchmark: 2%)
  const denialPenalty = Math.max(0, (denialRatePercent - 2) * 3);
  // Penalties for high AR days (benchmark: 28 days)
  const arPenalty = Math.max(0, (arDays - 28) * 0.8);
  // Penalties for low clean claim rate (benchmark: 98%)
  const cleanPenalty = Math.max(0, (98 - cleanClaimRatePercent) * 1.5);

  score = Math.max(30, Math.round(score - denialPenalty - arPenalty - cleanPenalty));

  let grade: "A+" | "A" | "B" | "C" | "D" = "B";
  let status: "EXCELLENT" | "HEALTHY" | "MODERATE_RISK" | "HIGH_LEAKAGE" = "MODERATE_RISK";

  if (score >= 90) {
    grade = "A+";
    status = "EXCELLENT";
  } else if (score >= 80) {
    grade = "A";
    status = "HEALTHY";
  } else if (score >= 65) {
    grade = "B";
    status = "MODERATE_RISK";
  } else if (score >= 50) {
    grade = "C";
    status = "HIGH_LEAKAGE";
  } else {
    grade = "D";
    status = "HIGH_LEAKAGE";
  }

  const recommendations: string[] = [];
  if (denialRatePercent > 5) {
    recommendations.push("Implement 3-tier automated claim scrubbing before submission to catch modifier and diagnosis mismatches.");
  }
  if (arDays > 35) {
    recommendations.push("Deploy dedicated AR aging specialists to work 60/90/120+ day balances and accelerate cash flow.");
  }
  if (cleanClaimRatePercent < 95) {
    recommendations.push("Enable 24-hour advance insurance eligibility verification to eliminate front-end rejections.");
  }

  return {
    score,
    grade,
    status,
    denialRate: denialRatePercent,
    arDays,
    cleanClaimRate: cleanClaimRatePercent,
    annualLeakageEstimate: denialRatePercent > 6 ? "High Revenue Leakage (10-15% of annual cash flow)" : "Moderate Optimization Potential",
    recommendations,
  };
}

