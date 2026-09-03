"use client";

import * as React from "react";
import {
  TrendingUp,
  CheckCircle,
  X,
  Sparkles,
  Server,
  DollarSign,
  Activity,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Award,
} from "lucide-react";

export interface RoiData {
  monthlyBilling: number;
  currentDenialRate: number;
  projectedDenialRate: number;
  monthlyLoss: number;
  monthlyRecovered: number;
  annualAdditionalRevenue: number;
  arDaysSaved: number;
  currency: string;
}

export interface EhrData {
  ehrName: string;
  isSupported: boolean;
  integrationType: string;
  setupTimeDays: number;
  features: string[];
  notes: string;
}

export interface BenchmarkData {
  specialty: string;
  industryDenialRate: string;
  nivrenCleanRate: string;
  averageArDays: number;
  topDenialReason: string;
  bestPracticeTip: string;
}

export interface DenialCodeData {
  code: string;
  name: string;
  category: string;
  explanation: string;
  recoveryStrategy: string;
  requiredDocuments: string[];
  nivrenAppealSuccessRate: string;
}

export interface HealthScoreData {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  status: string;
  denialRate: number;
  arDays: number;
  cleanClaimRate: number;
  annualLeakageEstimate: string;
  recommendations: string[];
}

export interface InteractiveCardPayload {
  type: "roi" | "ehr" | "benchmark" | "denial" | "health";
  roi?: RoiData;
  ehr?: EhrData;
  benchmark?: BenchmarkData;
  denial?: DenialCodeData;
  health?: HealthScoreData;
}

interface AgentInteractiveCardProps {
  card: InteractiveCardPayload;
  onClose: () => void;
  onRequestAudit?: () => void;
}

export function AgentInteractiveCard({ card, onClose, onRequestAudit }: AgentInteractiveCardProps) {
  // Local reactive slider for ROI calculator
  const [billingInput, setBillingInput] = React.useState<number>(card.roi?.monthlyBilling || 5000000);
  const [denialRateInput, setDenialRateInput] = React.useState<number>(card.roi?.currentDenialRate || 10);

  const currency = card.roi?.currency || "INR";
  const isINR = currency === "INR";

  // Re-calculate on slider drag
  const currentMonthlyLoss = Math.round(billingInput * (denialRateInput / 100));
  const recoveredMonthly = Math.round(billingInput * (Math.max(0, denialRateInput - 2) / 100));
  const annualRecovered = recoveredMonthly * 12;

  const formatMoney = (amount: number) => {
    if (isINR) {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div
      role="region"
      aria-label="AI Interactive Intelligence Card"
      className="fixed bottom-24 start-5 z-45 w-[min(380px,92vw)] overflow-hidden rounded-2xl border border-cyan-400/40 bg-slate-950/95 p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,211,238,0.25)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-300"
    >
      {/* Card Header with Glowing Icon & Dismiss Button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40">
            {card.type === "roi" && <DollarSign className="h-4 w-4" />}
            {card.type === "ehr" && <Server className="h-4 w-4" />}
            {card.type === "benchmark" && <TrendingUp className="h-4 w-4" />}
            {card.type === "denial" && <AlertTriangle className="h-4 w-4 text-amber-300" />}
            {card.type === "health" && <Award className="h-4 w-4 text-emerald-300" />}
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              {card.type === "roi" && "Live RCM ROI & Savings"}
              {card.type === "ehr" && "EHR Integration Verified"}
              {card.type === "benchmark" && "Specialty Benchmark Analysis"}
              {card.type === "denial" && "Denial Code Resolution Plan"}
              {card.type === "health" && "Practice RCM Health Score"}
            </h4>
            <span className="text-[10px] text-white/50">Dr. Dylan AI Decision Engine</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close card"
          className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 1. ROI & DENIAL SAVINGS CALCULATOR CARD */}
      {card.type === "roi" && (
        <div className="mt-3 space-y-3">
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">Monthly Practice Billing</span>
              <span className="font-bold text-cyan-300">{formatMoney(billingInput)}/mo</span>
            </div>
            <input
              type="range"
              min={isINR ? 500000 : 25000}
              max={isINR ? 20000000 : 1000000}
              step={isINR ? 250000 : 25000}
              value={billingInput}
              onChange={(e) => setBillingInput(Number(e.target.value))}
              className="mt-1.5 w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">Est. Denial Rate</span>
              <span className="font-bold text-rose-400">{denialRateInput}%</span>
            </div>
            <input
              type="range"
              min={4}
              max={25}
              step={1}
              value={denialRateInput}
              onChange={(e) => setDenialRateInput(Number(e.target.value))}
              className="mt-1.5 w-full accent-rose-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-2.5">
              <span className="block text-[10px] uppercase tracking-wide text-rose-300/70">Current Monthly Loss</span>
              <span className="text-base font-black text-rose-300">{formatMoney(currentMonthlyLoss)}</span>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2.5">
              <span className="block text-[10px] uppercase tracking-wide text-emerald-300/70">Annual Extra Recovery</span>
              <span className="text-base font-black text-emerald-300">{formatMoney(annualRecovered)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestAudit || onClose}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 active:scale-98 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Claim Free 100% Assessment
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. EHR COMPATIBILITY BADGE CARD */}
      {card.type === "ehr" && card.ehr && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3">
            <div>
              <h5 className="font-bold text-sm text-emerald-300">{card.ehr.ehrName}</h5>
              <span className="text-[11px] text-white/70">Direct Bi-directional FHIR / API</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/40">
              <CheckCircle className="h-3 w-3" />
              100% Ready
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Enabled Features:</span>
            {card.ehr.features.slice(0, 3).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-white/85">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-white/60 bg-slate-900/60 p-2 rounded-lg border border-white/5">
            ⏱️ Average setup time: <strong>{card.ehr.setupTimeDays} business days</strong> with zero clinical workflow disruption.
          </p>
        </div>
      )}

      {/* 3. SPECIALTY BENCHMARK CARD */}
      {card.type === "benchmark" && card.benchmark && (
        <div className="mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-sm text-cyan-300">{card.benchmark.specialty} Benchmarks</h5>
            <span className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded-full font-mono">
              Avg AR: {card.benchmark.averageArDays} Days
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-2">
              <span className="block text-[10px] text-white/50">Industry Denial Avg</span>
              <span className="text-base font-bold text-rose-400">{card.benchmark.industryDenialRate}</span>
            </div>
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-950/40 p-2">
              <span className="block text-[10px] text-cyan-300/70">NIVREN Clean Rate</span>
              <span className="text-base font-bold text-cyan-300">{card.benchmark.nivrenCleanRate}</span>
            </div>
          </div>

          <div className="text-[11px] text-white/75 bg-slate-900/80 p-2.5 rounded-xl border border-white/10 space-y-1">
            <span className="block text-[10px] font-bold text-amber-300 uppercase">💡 Best Practice:</span>
            <p className="leading-snug">{card.benchmark.bestPracticeTip}</p>
          </div>
        </div>
      )}

      {/* 4. DENIAL CODE RESOLUTION CARD */}
      {card.type === "denial" && card.denial && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-amber-950/40 border border-amber-500/30 p-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300/80 font-mono">{card.denial.code}</span>
              <h5 className="font-bold text-xs text-white leading-tight">{card.denial.name}</h5>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/40 whitespace-nowrap">
              {card.denial.nivrenAppealSuccessRate} Recovery
            </span>
          </div>

          <div className="text-[11px] text-white/80 bg-slate-900/60 p-2 rounded-lg border border-white/5 space-y-1">
            <span className="block text-[10px] font-bold text-cyan-300 uppercase">🛠️ NIVREN Appeal Action:</span>
            <p className="leading-snug text-white/90">{card.denial.recoveryStrategy}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Required Documents:</span>
            {card.denial.requiredDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-white/80">
                <FileText className="h-3 w-3 text-cyan-400 shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PRACTICE HEALTH SCORE CARD */}
      {card.type === "health" && card.health && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-400/30 p-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/50">Overall Health Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-300">{card.health.score}</span>
                <span className="text-xs text-white/50">/ 100</span>
                <span className="ms-1 rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/40">
                  Grade {card.health.grade}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {card.health.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="rounded-lg bg-slate-900/60 border border-white/10 p-1.5">
              <span className="block text-[9px] text-white/50">Denial Rate</span>
              <span className="font-bold text-rose-300">{card.health.denialRate}%</span>
            </div>
            <div className="rounded-lg bg-slate-900/60 border border-white/10 p-1.5">
              <span className="block text-[9px] text-white/50">Days in AR</span>
              <span className="font-bold text-cyan-300">{card.health.arDays}d</span>
            </div>
            <div className="rounded-lg bg-slate-900/60 border border-white/10 p-1.5">
              <span className="block text-[9px] text-white/50">Clean Claims</span>
              <span className="font-bold text-emerald-300">{card.health.cleanClaimRate}%</span>
            </div>
          </div>

          {card.health.recommendations[0] && (
            <div className="text-[11px] text-white/80 bg-slate-900/80 p-2 rounded-lg border border-white/10 space-y-0.5">
              <span className="block text-[9px] font-bold text-cyan-300 uppercase">🎯 Key Priority Fix:</span>
              <p className="leading-snug">{card.health.recommendations[0]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
