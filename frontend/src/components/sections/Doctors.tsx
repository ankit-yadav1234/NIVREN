import Link from "next/link";
import type { Doctor, Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { DoctorCard } from "@/components/healthcare/DoctorCard";
import { CardCarousel } from "@/components/healthcare/CardCarousel";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils/cn";
import { localePath } from "@/lib/utils/format";

export function Doctors({
  doctors,
  dict,
  locale,
}: {
  doctors: Doctor[];
  dict: Dictionary;
  locale: Locale;
  /** kept for API compatibility; the carousel shows all doctors */
  limit?: number;
}) {
  return (
    <Section muted>
      <SectionHeading title={dict.home.doctors.title} description={dict.home.doctors.description} />
      {doctors.length === 0 ? (
        <EmptyState title={dict.doctors.noResults} />
      ) : (
        <CardCarousel
          slides={doctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} locale={locale} dict={dict} />
          ))}
        />
      )}
      {doctors.length > 0 && (
        <div className="mt-8 text-center">
          <Link href={localePath("/doctors", locale)} className={cn(buttonVariants({ variant: "outline" }))}>
            {dict.common.actions.viewAll}
          </Link>
        </div>
      )}
    </Section>
  );
}
