import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { getDepartmentBySlug, getDepartmentSlugs } from "@/lib/api/departments";
import { getDoctorsByDepartment } from "@/lib/api/doctors";
import { getDepartmentMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { IllustrationPanel } from "@/components/ui/IllustrationPanel";
import { DoctorCard } from "@/components/healthcare/DoctorCard";
import { EmptyState } from "@/components/ui/states";

export function generateStaticParams() {
  return getDepartmentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const dept = await getDepartmentBySlug(slug);
  if (!dept) return {};
  return getDepartmentMetadata(dept, locale);
}

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dept = await getDepartmentBySlug(slug);
  if (!dept) notFound();

  const dict = getContent(locale);
  const doctors = await getDoctorsByDepartment(dept.id);

  return (
    <>
      <PageHeader
        title={dept.name}
        subtitle={dept.description}
        eyebrow="Department"
        image={dept.image}
        crumbs={[
          { label: dict.common.nav.home, href: "/" },
          { label: dict.departments.title, href: "/departments" },
          { label: dept.name },
        ]}
        locale={locale}
      />
      <Container className="py-12">
        <div className="mb-12 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <IllustrationPanel
            icon={dept.icon}
            src={dept.image}
            alt={dept.name}
            className="aspect-[4/3] w-full"
          />
          <div>
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-primary/10 text-primary">
              <Icon name={dept.icon} className="h-7 w-7" />
            </span>
            {dept.highlights && (
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {dept.highlights.map((h) => (
                  <li key={h} className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <h2 className="mb-5 text-xl font-semibold">{dict.departments.ourDoctors}</h2>
        {doctors.length === 0 ? (
          <EmptyState title={dict.departments.noDoctors} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((d) => (
              <DoctorCard key={d.id} doctor={d} locale={locale} dict={dict} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
