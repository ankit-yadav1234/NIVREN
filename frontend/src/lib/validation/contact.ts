import { z } from "zod";
import type { Dictionary } from "@/content/schema";

/** Built from the active locale's dictionary so every error message is translated too. */
export function createContactSchema(dict: Dictionary) {
  const v = dict.contact.form.validation;
  return z.object({
    name: z.string().min(2, v.nameRequired),
    email: z.string().email(v.emailInvalid),
    phone: z.string().optional().or(z.literal("")),
    interest: z.string().optional().or(z.literal("")),
    message: z.string().min(10, v.messageMinLength),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
