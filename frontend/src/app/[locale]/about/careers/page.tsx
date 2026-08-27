import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, TrendingUp, GraduationCap, Globe2 } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/animations/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const VALUES = [
  { icon: Users, title: "Certified expertise", body: "We invest in AAPC/AHIMA certification and ongoing training for every coder and biller on the team." },
  { icon: TrendingUp, title: "Room to grow", body: "RCM is a deep field — there's a real path from coder to team lead to account manager here." },
  { icon: GraduationCap, title: "Real training", body: "New hires ramp on our own hospital network's real claims before touching client accounts." },
  { icon: Globe2, title: "Remote-friendly", body: "Most roles are remote-first, with the flexibility that comes with it." },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: "Careers",
    description: "Join the team behind NIVREN's revenue cycle operations.",
    path: "/about/careers",
  });
}

export default async function CareersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getContent(locale);

  return (
    <>
      <PageHeader
        title="Careers"
        subtitle="We're a growing RCM team — certified coders, billers, and account managers who take claims as seriously as the providers we work for."
        crumbs={[
          { label: dict.common.nav.home, href: "/" },
          { label: dict.common.nav.about, href: "/about" },
          { label: "Careers" },
        ]}
        locale={locale}
      />

      <Container className="py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <Reveal key={v.title}>
              <Card className="h-full p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>

      <section className="py-16 md:py-20">
        <Container>
          <div className="rounded-[var(--radius-xl)] bg-primary px-6 py-12 text-center text-primary-foreground md:px-12">
            <h2 className="text-[length:var(--text-h2)] font-bold">We're not always hiring for a specific role</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              But we're always open to hearing from certified coders, billers, and RCM specialists. Reach out and tell us
              where you'd fit.
            </p>
            <Link
              href={localePath("/contact", locale)}
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-7")}
            >
              Get in touch
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
