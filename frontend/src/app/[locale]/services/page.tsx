import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getServices } from "@/lib/api/services";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceCard } from "@/components/healthcare/ServiceCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ title: dict.services.title, description: dict.services.subtitle, path: "/services" });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getContent(locale);
  const services = await getServices();

  return (
    <>
      <PageHeader
        title={dict.services.title}
        subtitle={dict.services.subtitle}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: dict.services.title }]}
        locale={locale}
      />
      <Container className="py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} locale={locale} />
          ))}
        </div>
      </Container>
    </>
  );
}
