import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/types";
import { AuthShell } from "@/components/layout/AuthShell";
import { SignupForm } from "@/components/sections/SignupForm";
import { localePath } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  await params;
  return { title: "Create Account" };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <AuthShell
      eyebrow="Patient Account"
      title="Create your account"
      subtitle="Set up an account to manage appointments and records."
      footer={
        <>
          Already have an account?{" "}
          <Link href={localePath("/login", locale)} className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm locale={locale} />
    </AuthShell>
  );
}
