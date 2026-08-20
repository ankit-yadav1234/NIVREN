import type { AppointmentInput, AppointmentResult } from "@/types";
import { env } from "@/config/environment";
import { apiFetch } from "./client";

/**
 * Submit an appointment request. With a real API configured this POSTs to the
 * backend; otherwise it simulates success. The UI form never changes.
 */
export async function submitAppointment(
  input: AppointmentInput,
): Promise<AppointmentResult> {
  if (env.useRemoteApi) {
    return apiFetch<AppointmentResult>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
  // Simulated latency + response (no PII is persisted anywhere client-side).
  await new Promise((r) => setTimeout(r, 800));
  return {
    success: true,
    referenceId: `REQ-${input.date.replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
    message: "Appointment request received.",
  };
}
