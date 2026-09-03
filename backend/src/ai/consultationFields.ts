/**
 * Single source of truth for the voice-fillable consultation/contact fields
 * — both the voice agent's tools (voice-agent/agent.ts) and its prompt
 * (ai/prompt.ts) derive the field list, required/optional split, and
 * per-field phrasing from this one array.
 */

export type ConsultationField = "name" | "phone" | "email" | "service" | "message";

export interface ConsultationFieldDef {
  key: ConsultationField;
  /** How to refer to this field when asking for it, e.g. "their phone number". */
  askAs: string;
  required: boolean;
}

export const CONSULTATION_FIELDS: ConsultationFieldDef[] = [
  { key: "name", askAs: "their full name", required: true },
  { key: "phone", askAs: "their phone number", required: true },
  { key: "email", askAs: "their email address (required for confirmation)", required: true },
  { key: "service", askAs: "which RCM service they need (Medical Billing, Medical Coding, Denial Management, AR Recovery, Eligibility Verification, Prior Authorization, or Practice Audit)", required: true },
  { key: "message", askAs: "a short note on their practice needs", required: false },
];

export const CONSULTATION_FIELD_KEYS = CONSULTATION_FIELDS.map((f) => f.key) as [ConsultationField, ...ConsultationField[]];

export const REQUIRED_CONSULTATION_FIELDS: ConsultationField[] = CONSULTATION_FIELDS.filter((f) => f.required).map((f) => f.key);

export const OPTIONAL_CONSULTATION_FIELDS: ConsultationField[] = CONSULTATION_FIELDS.filter((f) => !f.required).map((f) => f.key);
