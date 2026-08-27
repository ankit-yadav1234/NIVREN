import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { caseStudies } from "@/data/caseStudies";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
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
    title: "Case Studies",
    description: "Real revenue cycle outcomes from providers who partnered with NIVREN.",
    path: "/case-studies",
  });
}

export default async function CaseStudiesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getContent(locale);

  return (
    <>
      <PageHeader
        title="Case Studies"
        subtitle="What actually changed when these providers moved their revenue cycle to NIVREN."
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: "Case Studies" }]}
        locale={locale}
      />

      <Container className="py-12 md:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((c) => (
            <Reveal key={c.id}>
              <Card className="flex h-full flex-col justify-between p-6 sm:p-8 rounded-2xl border border-border/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div>
                  <div className="rounded-xl bg-primary/10 px-4 py-3 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{c.result.value}</div>
                    <div className="mt-0.5 text-xs sm:text-sm font-medium text-muted-foreground">{c.result.label}</div>
                  </div>
                  <h2 className="mt-5 text-[19px] font-semibold tracking-tight text-foreground">{c.client}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-0.5">{c.clientType}</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-foreground">The challenge</p>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{c.challenge}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Our approach</p>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{c.approach}</p>
                    </div>
                  </div>
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
