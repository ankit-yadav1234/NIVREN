"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import type { Department, Doctor } from "@/types";
import type { Dictionary } from "@/content/schema";
import { healthcareConfig } from "@/config/healthcare";
import { appointmentSchema, type AppointmentFormValues } from "@/lib/validation/appointment";
import { submitAppointment } from "@/lib/api/appointments";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormField, FormLabel, FormError } from "@/components/ui/FormField";
import { ErrorState } from "@/components/ui/states";
import { MedicalDisclaimer } from "./MedicalDisclaimer";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}
function maxDateISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function AppointmentForm({
  departments,
  doctors,
  dict,
  defaultDoctorId,
}: {
  departments: Department[];
  doctors: Doctor[];
  dict: Dictionary;
  defaultDoctorId?: string;
}) {
  const t = dict.appointment;
  const [result, setResult] = React.useState<{ referenceId?: string } | null>(null);
  const [submitError, setSubmitError] = React.useState(false);

  const defaultDoctor = doctors.find((d) => d.id === defaultDoctorId);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      departmentId: defaultDoctor?.departmentId ?? "",
      doctorId: defaultDoctorId ?? "",
    },
  });

  const selectedDept = useWatch({ control, name: "departmentId" });
  const filteredDoctors = selectedDept
    ? doctors.filter((d) => d.departmentId === selectedDept)
    : doctors;

  const onSubmit = async (values: AppointmentFormValues) => {
    setSubmitError(false);
    try {
      const res = await submitAppointment(values);
      if (res.success) {
        setResult({ referenceId: res.referenceId });
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    }
  };

  if (submitError) {
    return (
      <ErrorState
        title={dict.common.labels.error}
        description={dict.common.labels.errorBody}
        action={
          <Button variant="outline" onClick={() => setSubmitError(false)} className="mt-2">
            {dict.common.labels.retry}
          </Button>
        }
      />
    );
  }

  if (result) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden />
        <h3 className="mt-4 text-lg font-semibold">{t.success.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t.success.body}</p>
        {result.referenceId && (
          <p className="mt-3 text-sm font-medium">#{result.referenceId}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="name" required>
            {t.fields.name}
          </FormLabel>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          <FormError>{errors.name?.message}</FormError>
        </FormField>

        <FormField>
          <FormLabel htmlFor="phone" required>
            {t.fields.phone}
          </FormLabel>
          <Input id="phone" type="tel" {...register("phone")} aria-invalid={!!errors.phone} />
          <FormError>{errors.phone?.message}</FormError>
        </FormField>

        <FormField className="sm:col-span-2">
          <FormLabel htmlFor="email">{t.fields.email}</FormLabel>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          <FormError>{errors.email?.message}</FormError>
        </FormField>

        <FormField>
          <FormLabel htmlFor="departmentId" required>
            {t.fields.department}
          </FormLabel>
          <Select id="departmentId" {...register("departmentId")} aria-invalid={!!errors.departmentId}>
            <option value="">{t.fields.selectOption}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <FormError>{errors.departmentId?.message}</FormError>
        </FormField>

        <FormField>
          <FormLabel htmlFor="doctorId">{t.fields.doctor}</FormLabel>
          <Select id="doctorId" {...register("doctorId")}>
            <option value="">{t.fields.selectOption}</option>
            {filteredDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField>
          <FormLabel htmlFor="date" required>
            {t.fields.date}
          </FormLabel>
          <Input
            id="date"
            type="date"
            min={todayISO()}
            max={maxDateISO(healthcareConfig.appointment.maxAdvanceDays)}
            {...register("date")}
            aria-invalid={!!errors.date}
          />
          <FormError>{errors.date?.message}</FormError>
        </FormField>

        <FormField>
          <FormLabel htmlFor="time" required>
            {t.fields.time}
          </FormLabel>
          <Select id="time" {...register("time")} aria-invalid={!!errors.time}>
            <option value="">{t.fields.selectOption}</option>
            {healthcareConfig.appointment.timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
          <FormError>{errors.time?.message}</FormError>
        </FormField>

        <FormField className="sm:col-span-2">
          <FormLabel htmlFor="reason">{t.fields.reason}</FormLabel>
          <Textarea id="reason" {...register("reason")} />
          <FormError>{errors.reason?.message}</FormError>
        </FormField>
      </div>

      <div className="mt-2 space-y-4">
        <MedicalDisclaimer text={t.disclaimer} />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="uppercase tracking-wide">
          {isSubmitting ? t.submitting : dict.common.actions.bookAppointment}
        </Button>
      </div>
    </form>
  );
}
