"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import type { Locale } from "@/types";
import { signupSchema, type SignupFormValues } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { FormField, FormLabel, FormError } from "@/components/ui/FormField";
import { localePath } from "@/lib/utils/format";

/** Same honest "no backend yet" pattern as LoginForm — see its comment. */
export function SignupForm({ locale }: { locale: Locale }) {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

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
          Online account creation isn&apos;t connected yet. To book an appointment right now, use our
          appointment form — no account required.
        </p>
        <Link
          href={localePath("/appointment", locale)}
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Book an appointment →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField>
        <FormLabel htmlFor="signup-name" required>
          Full Name
        </FormLabel>
        <Input id="signup-name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
        <FormError>{errors.name?.message}</FormError>
      </FormField>
      <FormField>
        <FormLabel htmlFor="signup-email" required>
          Email
        </FormLabel>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        <FormError>{errors.email?.message}</FormError>
      </FormField>
      <FormField>
        <FormLabel htmlFor="signup-password" required>
          Password
        </FormLabel>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        <FormError>{errors.password?.message}</FormError>
      </FormField>
      <FormField>
        <FormLabel htmlFor="signup-confirm" required>
          Confirm Password
        </FormLabel>
        <Input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          aria-invalid={!!errors.confirmPassword}
        />
        <FormError>{errors.confirmPassword?.message}</FormError>
      </FormField>
      <div className="mb-5">
        <Checkbox
          required
          label={
            <>
              I agree to the{" "}
              <Link href={localePath("/terms", locale)} className="font-medium text-primary hover:underline">
                Terms of Service
              </Link>
            </>
          }
        />
      </div>
      <Button type="submit" fullWidth loading={isSubmitting}>
        Create Account
      </Button>
    </form>
  );
}
