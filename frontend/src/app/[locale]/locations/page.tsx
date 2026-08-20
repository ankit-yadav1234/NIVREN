import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLocations } from "@/lib/api/locations";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { LocationCard } from "@/components/healthcare/LocationCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ title: dict.locations.title, description: dict.locations.subtitle, path: "/locations" });
}

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getContent(locale);
  const locations = await getLocations();

  return (
    <>
      <PageHeader
        title={dict.locations.title}
        subtitle={dict.locations.subtitle}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: dict.locations.title }]}
        locale={locale}
      />
      <Container className="py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((l) => (
            <LocationCard key={l.id} location={l} locale={locale} dict={dict} />
          ))}
        </div>
      </Container>
    </>
  );
}
