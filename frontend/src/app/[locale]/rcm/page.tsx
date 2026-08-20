import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRcmServices } from "@/lib/api/rcm";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants } from "@/components/ui/Button";
import { RcmHero } from "@/components/sections/RcmHero";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils/cn";
import { localePath } from "@/lib/utils/format";

const WHY = [
  { value: "98%", label: "Clean claim rate" },
  { value: "28 days", label: "Average days in AR" },
  { value: "-35%", label: "Denials reduced" },
  { value: "24/7", label: "Dedicated support" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  await params;
  return buildMetadata({
    title: "Revenue Cycle Management",
    description:
      "End-to-end RCM services — medical billing, coding, denial management, AR follow-up, credentialing and analytics that help providers collect more, faster.",
    path: "/rcm",
  });
}

export default async function RcmPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const services = await getRcmServices();

  return (
    <>
      <RcmHero
        eyebrow="Revenue Cycle Management"
        title="Get paid for the care you already deliver"
        description="From patient access to final payment — we manage your entire revenue cycle so your team can focus on care, not paperwork."
        locale={locale}
      />

      {/* Why choose us */}
      <Container className="py-12">
        <Reveal className="grid grid-cols-2 gap-6 rounded-[var(--radius-lg)] border border-border bg-card p-8 sm:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.label} className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">{w.value}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{w.label}</div>
            </div>
          ))}
        </Reveal>
      </Container>

      {/* Services */}
      <Section muted>
        <SectionHeading
          title="Our RCM Services"
          description="A complete, modular revenue cycle — pick the services you need or let us run it all."
        />
        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s.id} href={localePath(`/rcm/${s.slug}`, locale)} className="group focus-visible:outline-none">
              <Card className="h-full p-6 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{s.tagline}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" aria-hidden />
                </span>
              </Card>
            </Link>
          ))}
        </Reveal>
      </Section>

      {/* Value props */}
      <Section>
        <SectionHeading title="Why providers choose us" description="Technology-driven, compliance-first, and relentlessly focused on your bottom line." />
        <Reveal className="mx-auto grid max-w-3xl gap-3">
          {[
            "HIPAA-compliant, secure workflows end to end",
            "Certified coders and dedicated account managers",
            "Transparent reporting with real-time KPIs",
            "Specialty-specific expertise across practices",
          ].map((point) => (
            <div key={point} className="flex items-start gap-3 rounded-[var(--radius-md)] bg-card p-4 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
              <span className="text-sm">{point}</span>
            </div>
          ))}
        </Reveal>
      </Section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="rounded-[var(--radius-xl)] bg-primary px-6 py-12 text-center text-primary-foreground md:px-12">
            <h2 className="text-[length:var(--text-h2)] font-bold">Ready to improve your collections?</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Get a free revenue cycle assessment and see where you&apos;re leaving money on the table.
            </p>
            <Link
              href={localePath("/contact", locale)}
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-7")}
            >
              Request a free assessment
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
