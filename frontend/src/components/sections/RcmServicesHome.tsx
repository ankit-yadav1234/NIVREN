import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import type { RcmService } from "@/types";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/animations/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/** Home-page teaser grid for RCM services — 5 service cards + 1 full-suite explore card in a balanced 6-grid. */
export function RcmServicesHome({
  services,
  locale,
  limit = 5,
}: {
  services: RcmService[];
  locale: Locale;
  limit?: number;
}) {
  return (
    <Section id="rcm-services" muted>
      <SectionHeading
        eyebrow="Our Services & Solutions"
        title="A complete, modular revenue cycle"
        description="Pick the services you need or let us run your entire revenue cycle end to end."
      />
      <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, limit).map((s) => (
          <Link key={s.id} href={localePath(`/rcm/${s.slug}`, locale)} className="group focus-visible:outline-none">
            <Card className="flex h-full min-h-[240px] flex-col justify-between p-7 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <div>
                <span className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                  <Icon name={s.icon} className="h-[26px] w-[26px]" />
                </span>
                <h3 className="text-[19px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-[15px] font-medium text-primary leading-snug">{s.tagline}</p>
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
  );
}
