import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { getDoctorBySlug, getDoctorSlugs } from "@/lib/api/doctors";
import { getDepartmentBySlug } from "@/lib/api/departments";
import { departments } from "@/data/departments";
import { getDoctorMetadata } from "@/lib/seo/metadata";
import { physicianJsonLd } from "@/lib/seo/structured-data";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { DoctorProfile } from "@/components/healthcare/DoctorProfile";

export function generateStaticParams() {
  return getDoctorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) return {};
  return getDoctorMetadata(doctor);
}

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) notFound();

  const dict = getContent(locale);
  const department =
    departments.find((d) => d.id === doctor.departmentId) ??
    (await getDepartmentBySlug(doctor.departmentId));

  return (
    <>
      <PageHeader
        title={doctor.name}
        subtitle={doctor.specialty}
        crumbs={[
          { label: dict.common.nav.home, href: "/" },
          { label: dict.doctors.title, href: "/doctors" },
          { label: doctor.name },
        ]}
        locale={locale}
      />
      <Container className="py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd(doctor)) }}
        />
        <DoctorProfile doctor={doctor} department={department} dict={dict} locale={locale} />
      </Container>
    </>
  );
}
