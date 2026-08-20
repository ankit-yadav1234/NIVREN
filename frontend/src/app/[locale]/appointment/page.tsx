import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getDepartments } from "@/lib/api/departments";
import { getDoctors } from "@/lib/api/doctors";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "@/components/healthcare/AppointmentForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ title: dict.appointment.title, description: dict.appointment.subtitle, path: "/appointment" });
}

export default async function AppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ doctor?: string }>;
}) {
  const { locale } = await params;
  const { doctor } = await searchParams;
  const dict = getContent(locale);

  const [departments, doctors] = await Promise.all([getDepartments(), getDoctors()]);

  return (
    <>
      <PageHeader
        title={dict.appointment.title}
        subtitle={dict.appointment.subtitle}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: dict.appointment.title }]}
        locale={locale}
      />
      <Container className="py-12">
        <Card className="mx-auto max-w-2xl p-6 md:p-8">
          <AppointmentForm
            departments={departments}
            doctors={doctors}
            dict={dict}
            defaultDoctorId={doctor}
          />
        </Card>
      </Container>
    </>
  );
}
