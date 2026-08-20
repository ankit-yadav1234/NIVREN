import Link from "next/link";
import type { Locale, Service } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { ServiceCard } from "@/components/healthcare/ServiceCard";
import { Reveal } from "@/components/animations/Reveal";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils/cn";
import { localePath } from "@/lib/utils/format";

export function Services({
  services,
  dict,
  locale,
  limit,
}: {
  services: Service[];
  dict: Dictionary;
  locale: Locale;
  limit?: number;
}) {
  const list = limit ? services.slice(0, limit) : services;
  return (
    <Section>
      <SectionHeading title={dict.home.services.title} description={dict.home.services.description} />
      {list.length === 0 ? (
        <EmptyState title={dict.common.labels.empty} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i, 5) * 0.08}>
              <ServiceCard service={s} locale={locale} />
            </Reveal>
          ))}
        </div>
      )}
      {limit && services.length > limit && (
        <div className="mt-8 text-center">
          <Link href={localePath("/services", locale)} className={cn(buttonVariants({ variant: "outline" }))}>
            {dict.common.actions.viewAll}
          </Link>
        </div>
      )}
    </Section>
  );
}
