"use client";

import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { useLocale } from "@/hooks/useLocale";
import { localePath } from "@/lib/utils/format";

const quickLinks = [
  { label: "Departments", href: "/departments" },
  { label: "Find a Doctor", href: "/doctors" },
  { label: "Contact Us", href: "/contact" },
];

export default function NotFound() {
  const { dict, locale } = useLocale();
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HeartPulse className="h-8 w-8" aria-hidden />
      </span>
      <p className="mt-6 text-7xl font-bold text-primary md:text-8xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold">{dict.common.labels.notFoundTitle}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{dict.common.labels.notFoundBody}</p>
      <Link href={localePath("/", locale)} className={buttonVariants({ size: "lg", className: "mt-7" })}>
        {dict.common.labels.backHome}
      </Link>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={localePath(link.href, locale)}
            className="font-medium text-primary hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </Container>
  );
}
