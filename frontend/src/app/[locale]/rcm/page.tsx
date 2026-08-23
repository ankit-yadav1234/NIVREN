import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileWarning, Clock, ShieldAlert, TrendingDown, Star } from "lucide-react";
import type { Locale } from "@/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRcmServices } from "@/lib/api/rcm";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { buttonVariants } from "@/components/ui/Button";
import { RcmHero } from "@/components/sections/RcmHero";
import { FAQ } from "@/components/healthcare/FAQ";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils/cn";
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

      {/* Pain points */}
      <Section>
        <SectionHeading
          title="Where practices lose revenue without knowing it"
          description="Generic billing teams miss these every day — ours don't."
        />
        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PAIN_POINTS.map((p) => (
            <Card key={p.title} className="p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-destructive/10 text-destructive">
                <p.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
            </Card>
          ))}
        </Reveal>
      </Section>

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
      <Section muted>
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

      {/* Client testimonial */}
      <Section>
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex justify-center" aria-label="5 / 5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" aria-hidden />
            ))}
          </div>
          <p className="mt-4 text-[length:var(--text-h3)] font-semibold leading-snug text-foreground">
            &ldquo;Switching our billing over to NIVREN&apos;s RCM team cut our denial rate almost in
            half within two quarters. We finally have visibility into where every claim stands.&rdquo;
          </p>
          <div className="mx-auto mt-6 flex w-fit items-center gap-3">
            <Avatar name="Rohit Malhotra" size={48} className="ring-2 ring-background" />
            <div className="text-start">
              <p className="text-sm font-semibold">Rohit Malhotra</p>
              <p className="text-xs text-muted-foreground">Practice Administrator, Sunrise Multispecialty Clinic</p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section muted>
        <SectionHeading
          title="Frequently asked questions"
          description="Everything providers ask before switching their revenue cycle over to us."
        />
        <Reveal className="mx-auto max-w-3xl">
          <FAQ faqs={RCM_FAQS} />
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
