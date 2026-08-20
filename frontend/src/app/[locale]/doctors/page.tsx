import { Suspense } from "react";
import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getDoctors,
  getSpecialties,
  getDoctorLanguages,
  type DoctorFilters,
} from "@/lib/api/doctors";
import { getDepartments } from "@/lib/api/departments";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/layout/PageHeader";
import { DoctorSearch } from "@/components/healthcare/DoctorSearch";
import { DoctorCard } from "@/components/healthcare/DoctorCard";
import { DepartmentDoctorDirectory } from "@/components/sections/DepartmentDoctorDirectory";
import { Section, SectionHeading } from "@/components/ui/Section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ title: dict.doctors.title, description: dict.doctors.subtitle, path: "/doctors" });
}

export default async function DoctorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const dict = getContent(locale);

  const filters: DoctorFilters = {
    q: sp.q,
    department: sp.department,
    specialty: sp.specialty,
    language: sp.language,
  };

  const [doctors, departments, allDoctors] = await Promise.all([
    getDoctors(filters),
    getDepartments(),
    getDoctors(),
  ]);
  const specialties = getSpecialties();
  const languages = getDoctorLanguages();

  return (
    <>
      <PageHeader
        title={dict.doctors.title}
        subtitle={dict.doctors.subtitle}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: dict.doctors.title }]}
        locale={locale}
      />
      <Container className="py-12">
        <Suspense fallback={null}>
          <DoctorSearch
            departments={departments}
            specialties={specialties}
            languages={languages}
            dict={dict}
          />
        </Suspense>

        {doctors.length === 0 ? (
          <EmptyState title={dict.doctors.noResults} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((d) => (
              <DoctorCard key={d.id} doctor={d} locale={locale} dict={dict} />
            ))}
          </div>
        )}
      </Container>

      <Section muted>
        <SectionHeading
          title="Browse by Department"
          description="Every specialist, organized by department. Tap a doctor to see their full profile."
        />
        <DepartmentDoctorDirectory departments={departments} doctors={allDoctors} locale={locale} dict={dict} />
      </Section>
    </>
  );
}
