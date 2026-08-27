import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRcmServiceBySlug, getRcmServiceSlugs, getRcmServices } from "@/lib/api/rcm";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils/cn";
import { localePath } from "@/lib/utils/format";

export function generateStaticParams() {
  return getRcmServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getRcmServiceBySlug(slug);
  if (!service) return {};
  return buildMetadata({
    locale,
    title: service.title,
    description: service.description,
    path: `/rcm/${service.slug}`,
  });
}

export default async function RcmServiceDetail({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = await getRcmServiceBySlug(slug);
  if (!service) notFound();

  const dict = getContent(locale);
  const others = (await getRcmServices()).filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <>
      <PageHeader
        title={service.title}
        subtitle={service.tagline}
        crumbs={[
          { label: dict.common.nav.home, href: "/" },
          { label: "RCM", href: "/rcm" },
          { label: service.title },
        ]}
        locale={locale}
      />

      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-primary/10 text-primary">
                <Icon name={service.icon} className="h-7 w-7" />
              </span>
              <p className="text-[length:var(--text-body)] text-muted-foreground">{service.description}</p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Key benefits</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {service.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                    <span className="text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">How it works</h2>
              <ol className="grid gap-4 sm:grid-cols-3">
                {service.process.map((step, i) => (
                  <li key={step.title} className="rounded-[var(--radius-lg)] border border-border p-5">
                    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-1">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary">{service.stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{service.stat.label}</div>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold">Talk to our RCM team</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get a free assessment tailored to your practice.
              </p>
              <Link
                href={localePath("/contact", locale)}
                className={cn(buttonVariants({ fullWidth: true }), "mt-4")}
              >
                Request a free assessment
              </Link>
            </Card>
          </aside>
        </div>
      </Container>

      {/* Other services */}
      <Section muted>
        <SectionHeading title="Explore more RCM services" />
        <Reveal className="grid gap-5 sm:grid-cols-3">
          {others.map((s) => (
            <Link key={s.id} href={localePath(`/rcm/${s.slug}`, locale)} className="group focus-visible:outline-none">
              <Card className="h-full p-6 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
                <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.tagline}</p>
              </Card>
            </Link>
          ))}
        </Reveal>
      </Section>
    </>
  );
}
