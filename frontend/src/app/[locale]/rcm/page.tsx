import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileWarning, Clock, ShieldAlert, TrendingDown, Star } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRcmServices } from "@/lib/api/rcm";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { RcmHero } from "@/components/sections/RcmHero";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";
import { FAQ } from "@/components/healthcare/FAQ";
import { Reveal } from "@/components/animations/Reveal";
import { localePath } from "@/lib/utils/format";

const WHY = [
  { value: "98%", label: "Clean claim rate" },
  { value: "28 days", label: "Average days in AR" },
  { value: "-35%", label: "Denials reduced" },
  { value: "24/7", label: "Dedicated support" },
];

const PAIN_POINTS = [
  {
    icon: FileWarning,
    title: "Coding errors slip through",
    body: "Incomplete documentation or a missed modifier quietly cuts into what a claim is actually worth.",
  },
  {
    icon: ShieldAlert,
    title: "Every payer plays by different rules",
    body: "One insurer's clean claim is another's denial — generic billing teams can't keep up with all of them.",
  },
  {
    icon: Clock,
    title: "Prior authorizations stall care",
    body: "A slow approval pushes back the procedure and pushes back the payment that follows it.",
  },
  {
    icon: TrendingDown,
    title: "Denials repeat without a fix",
    body: "Without a root-cause review, the same denial reason keeps costing you the following month too.",
  },
];

const RCM_FAQS = [
  {
    id: "onboarding",
    question: "How quickly can we onboard with your RCM team?",
    answer:
      "Most practices are fully transitioned within 2–3 weeks. We start with a claims and workflow audit, then phase in coding, billing, and follow-up so nothing falls through during the switch.",
  },
  {
    id: "software",
    question: "Do you work with our existing practice management software?",
    answer:
      "Yes — our team works within your current PM/EHR system rather than asking you to migrate. We adapt to your setup, not the other way around.",
  },
  {
    id: "denials",
    question: "What happens when a claim gets denied?",
    answer:
      "Every denial gets a root-cause review, not just a resubmission. We track denial categories over time so the same issue doesn't keep recurring quarter after quarter.",
  },
  {
    id: "security",
    question: "Is our patient data secure and HIPAA-compliant?",
    answer:
      "All workflows run through HIPAA-compliant, encrypted systems, with access limited to the staff directly handling your account.",
  },
  {
    id: "modular",
    question: "Can we start with just one service, like coding or AR follow-up?",
    answer:
      "Yes — our RCM services are modular. Many practices start with a single service and expand once they see the results.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: "Revenue Cycle Management",
    description:
      "End-to-end RCM services — medical billing, coding, denial management, AR follow-up, credentialing and analytics that help providers collect more, faster.",
    path: "/rcm",
  });
}

export default async function RcmPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const services = await getRcmServices();
  const dict = getContent(locale);

  return (
    <>
      <RcmHero
        eyebrow="Revenue Cycle Management"
        title="Get paid for the care you already deliver"
        description="From patient access to final payment — we manage your entire revenue cycle so your team can focus on care, not paperwork."
        locale={locale}
      />

      {/* Pain points */}
      <Section>
        <SectionHeading
          eyebrow="Challenges"
          title="Where practices lose revenue without knowing it"
          description="Generic billing teams miss these every day — ours don't."
        />
        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PAIN_POINTS.map((p) => (
            <Card key={p.title} className="p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-destructive/10 text-destructive">
                  <p.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-[18px] font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </Card>
          ))}
        </Reveal>
      </Section>

      {/* Why choose us */}
      <Container className="py-8 sm:py-12">
        <Reveal className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 sm:grid-cols-4 shadow-sm">
          {WHY.map((w) => (
            <div key={w.label} className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">{w.value}</div>
              <div className="mt-1.5 text-xs font-medium text-muted-foreground sm:text-sm">{w.label}</div>
            </div>
          ))}
        </Reveal>
      </Container>

      {/* Services */}
      <Section muted>
        <SectionHeading
          eyebrow="Modular Solutions"
          title="Our RCM Services"
          description="A complete, modular revenue cycle — pick the services you need or let us run it all."
        />
        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s.id} href={localePath(`/rcm/${s.slug}`, locale)} className="group focus-visible:outline-none">
              <Card className="flex h-full min-h-[250px] flex-col justify-between p-6 sm:p-7 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <div>
                  <span className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                    <Icon name={s.icon} className="h-[26px] w-[26px]" />
                  </span>
                  <h3 className="text-[19px] font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] font-medium text-primary leading-snug">{s.tagline}</p>
                  <p className="mt-2 line-clamp-3 text-[14px] text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary">
                  Learn more
                  <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1.5 rtl:rotate-180" aria-hidden />
                </span>
              </Card>
            </Link>
          ))}
        </Reveal>
      </Section>

      {/* Value props */}
      <Section muted>
        <SectionHeading
          eyebrow="Why NIVREN"
          title="Why providers choose us"
          description="Technology-driven, compliance-first, and relentlessly focused on your bottom line."
        />
        <Reveal className="mx-auto grid max-w-3xl gap-3.5">
          {[
            "HIPAA-compliant, secure workflows end to end",
            "Certified coders and dedicated account managers",
            "Transparent reporting with real-time KPIs",
            "Specialty-specific expertise across practices",
          ].map((point) => (
            <div key={point} className="flex items-start gap-3.5 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="text-sm sm:text-base font-medium text-foreground">{point}</span>
            </div>
          ))}
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section muted>
        <SectionHeading
          eyebrow="Common Questions"
          title="Frequently asked questions"
          description="Everything providers ask before switching their revenue cycle over to us."
        />
        <Reveal className="mx-auto max-w-3xl">
          <FAQ faqs={RCM_FAQS} />
        </Reveal>
      </Section>

      {/* Standardized CTA */}
      <AppointmentCTA dict={dict} locale={locale} />
    </>
  );
}
