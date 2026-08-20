import { z } from "zod";

export const appointmentSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number.")
    .regex(/^[+\d][\d\s-]{6,}$/, "Please enter a valid phone number."),
  email: z.string().email("Please enter a valid email.").optional().or(z.literal("")),
  departmentId: z.string().min(1, "Please select a department."),
  doctorId: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Please choose a date."),
  time: z.string().min(1, "Please choose a time."),
  reason: z.string().max(500, "Please keep it under 500 characters.").optional().or(z.literal("")),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
