import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/types";
import { AuthShell } from "@/components/layout/AuthShell";
import { LoginForm } from "@/components/sections/LoginForm";
import { localePath } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  await params;
  return { title: "Sign In" };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <AuthShell
      eyebrow="Patient Account"
      title="Welcome back"
      subtitle="Sign in to manage your appointments and care."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={localePath("/signup", locale)} className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
