import Link from "next/link";
import type { Department, Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { DepartmentCard } from "@/components/healthcare/DepartmentCard";
import { Reveal } from "@/components/animations/Reveal";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils/cn";
import { localePath } from "@/lib/utils/format";

export function Departments({
  departments,
  dict,
  locale,
  limit,
}: {
  departments: Department[];
  dict: Dictionary;
  locale: Locale;
  limit?: number;
}) {
  const list = limit ? departments.slice(0, limit) : departments;
  return (
    <Section>
      <SectionHeading title={dict.home.departments.title} description={dict.home.departments.description} />
      {list.length === 0 ? (
        <EmptyState title={dict.common.labels.empty} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d, i) => (
            <Reveal key={d.id} delay={Math.min(i, 5) * 0.08}>
              <DepartmentCard department={d} locale={locale} />
            </Reveal>
          ))}
        </div>
      )}
      {limit && departments.length > limit && (
        <div className="mt-8 text-center">
          <Link href={localePath("/departments", locale)} className={cn(buttonVariants({ variant: "outline" }))}>
            {dict.common.actions.viewAll}
          </Link>
        </div>
      )}
    </Section>
  );
}
