"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import type { Locale } from "@/types";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { FormField, FormLabel, FormError } from "@/components/ui/FormField";
import { localePath } from "@/lib/utils/format";

/**
 * No account system exists yet (no auth backend). Rather than pretend a
 * sign-in succeeded, submitting shows an honest "coming soon" message with a
 * real path to a human (the contact page) instead of a fake success state.
 */
export function LoginForm({ locale }: { locale: Locale }) {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <Info className="mx-auto h-10 w-10 text-primary" aria-hidden />
        <h2 className="mt-3 text-lg font-semibold">Patient portal launching soon</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Online account access isn&apos;t connected yet. For appointment or billing questions right
          now, reach our care team directly and we&apos;ll help you personally.
        </p>
        <Link
          href={localePath("/contact", locale)}
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Contact our care team →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField>
        <FormLabel htmlFor="login-email" required>
          Email
        </FormLabel>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        <FormError>{errors.email?.message}</FormError>
      </FormField>
      <FormField>
        <FormLabel htmlFor="login-password" required>
          Password
        </FormLabel>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        <FormError>{errors.password?.message}</FormError>
      </FormField>
      <div className="mb-5 flex items-center justify-between">
        <Checkbox label="Remember me" />
        <Link href={localePath("/contact", locale)} className="text-sm font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" fullWidth loading={isSubmitting}>
        Sign In
      </Button>
    </form>
  );
}
