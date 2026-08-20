import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Please enter at least 10 characters."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
