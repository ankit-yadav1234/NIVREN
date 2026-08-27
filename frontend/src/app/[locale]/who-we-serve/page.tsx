import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { whoWeServe } from "@/data/whoWeServe";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";
import { Reveal } from "@/components/animations/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: "Who We Serve",
    description: "RCM support built for hospitals, physician groups, clinics, and healthcare organizations of every size.",
    path: "/who-we-serve",
  });
}

export default async function WhoWeServePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getContent(locale);

  return (
    <>
      <PageHeader
        title="Who We Serve"
        subtitle="From a single-location practice to a multi-site health system — RCM support sized to how you actually operate."
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: "Who We Serve" }]}
        locale={locale}
      />

      <Container className="py-12 md:py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {whoWeServe.map((segment) => (
            <Reveal key={segment.id}>
              <Card className="flex h-full flex-col justify-between p-6 sm:p-8 rounded-2xl border border-border/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div>
                  <span className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                    <Icon name={segment.icon} className="h-[26px] w-[26px]" />
                  </span>
                  <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{segment.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{segment.description}</p>
                  <ul className="mt-5 space-y-2.5">
                    {segment.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-[14px] text-foreground/90">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>

      <AppointmentCTA dict={dict} locale={locale} />
    </>
  );
}
