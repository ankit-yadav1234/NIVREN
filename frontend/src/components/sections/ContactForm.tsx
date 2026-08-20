"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import type { Dictionary } from "@/content/schema";
import { contactSchema, type ContactFormValues } from "@/lib/validation/contact";
import { submitContactMessage } from "@/lib/api/contact";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormField, FormLabel, FormError } from "@/components/ui/FormField";
import { ErrorState } from "@/components/ui/states";

export function ContactForm({ dict }: { dict: Dictionary }) {
  const t = dict.contact;
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitError(false);
    try {
      const res = await submitContactMessage(values);
      if (res.success) {
        setSent(true);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    }
  };

  if (sent) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-success/30 bg-success/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden />
        <p className="mt-3 text-sm">{t.success}</p>
      </div>
    );
  }

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="c-name" required>
            {t.form.name}
          </FormLabel>
          <Input id="c-name" {...register("name")} aria-invalid={!!errors.name} />
          <FormError>{errors.name?.message}</FormError>
        </FormField>
        <FormField>
          <FormLabel htmlFor="c-email" required>
            {t.form.email}
          </FormLabel>
          <Input id="c-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          <FormError>{errors.email?.message}</FormError>
        </FormField>
        <FormField className="sm:col-span-2">
          <FormLabel htmlFor="c-phone">{t.form.phone}</FormLabel>
          <Input id="c-phone" type="tel" {...register("phone")} />
        </FormField>
        <FormField className="sm:col-span-2">
          <FormLabel htmlFor="c-message" required>
            {t.form.message}
          </FormLabel>
          <Textarea id="c-message" {...register("message")} aria-invalid={!!errors.message} />
          <FormError>{errors.message?.message}</FormError>
        </FormField>
      </div>
      <Button type="submit" fullWidth loading={isSubmitting}>
        {t.form.send}
      </Button>
    </form>
  );
}
