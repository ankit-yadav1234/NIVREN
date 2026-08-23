import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getDepartments } from "@/lib/api/departments";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { DepartmentCard } from "@/components/healthcare/DepartmentCard";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { departmentsBanner } from "@/data/heroBanners";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ title: dict.departments.title, description: dict.departments.subtitle, path: "/departments" });
}

export default async function DepartmentsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getContent(locale);
  const departments = await getDepartments();

  return (
    <>
      <PageHeader
        title={dict.departments.title}
        subtitle={dict.departments.subtitle}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: dict.departments.title }]}
        locale={locale}
      />
      <HeroBanner data={departmentsBanner} locale={locale} />
      <Container className="py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <DepartmentCard key={d.id} department={d} locale={locale} />
          ))}
        </div>
      </Container>
    </>
  );
}
