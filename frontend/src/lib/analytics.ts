"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * The only events this site sends to GA4 — deliberately a closed list, not a
 * free-form string, so a call site can't accidentally invent a new event or
 * (more importantly) slip a PII-carrying param through. sendGAEvent() itself
 * no-ops safely if GA hasn't loaded (no NEXT_PUBLIC_GA_MEASUREMENT_ID set).
 *
 * Consultation events track the ACTION, never the value: e.g.
 * consultation_field_completed carries which field (name/phone/service/...)
 * was filled, never what the user actually typed into it.
 */
export type AnalyticsEvent =
  | { name: "language_change"; locale: "en" | "hi" | "ar" }
  | { name: "theme_change"; theme: "dark" | "light" }
  | { name: "voice_assistant_open" }
  | { name: "voice_conversation_start" }
  | { name: "consultation_start"; source: "voice" | "text" | "form" }
  | { name: "consultation_field_completed"; field: string }
  | { name: "consultation_confirmation" }
  | { name: "consultation_submit" }
  | { name: "consultation_submit_success" }
  | { name: "consultation_submit_failure" }
  | { name: "cta_click"; label: string }
  | { name: "contact_interaction"; method: "phone" | "email" | "form" };

export function trackEvent(event: AnalyticsEvent) {
  const { name, ...params } = event;
  try {
    sendGAEvent({ event: name, ...params });
  } catch {
    // Analytics must never break the app — swallow and move on.
  }
}
