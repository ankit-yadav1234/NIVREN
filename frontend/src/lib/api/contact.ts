import type { ContactFormValues } from "@/lib/validation/contact";
import { env } from "@/config/environment";
import { apiFetch } from "./client";

export interface ContactResult {
  success: boolean;
  message?: string;
}

/**
 * Submit a contact message. With a real API configured this POSTs to the
 * backend; otherwise it simulates success (mirrors submitAppointment).
 */
export async function submitContactMessage(input: ContactFormValues): Promise<ContactResult> {
  if (env.useRemoteApi) {
    return apiFetch<ContactResult>("/api/contact", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, message: "Your message has been received." };
}
