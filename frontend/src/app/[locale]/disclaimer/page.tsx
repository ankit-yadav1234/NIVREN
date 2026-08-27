import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { MedicalDisclaimer } from "@/components/healthcare/MedicalDisclaimer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ locale, title: dict.common.nav.medicalDisclaimer, path: "/disclaimer" });
}

export default async function DisclaimerPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getContent(locale);
  const title = dict.common.nav.medicalDisclaimer;
  return (
    <>
      <PageHeader
        title={title}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: title }]}
        locale={locale}
      />
      <Container className="max-w-3xl py-12">
        <MedicalDisclaimer text={dict.legal.disclaimer} />
      </Container>
    </>
  );
}
