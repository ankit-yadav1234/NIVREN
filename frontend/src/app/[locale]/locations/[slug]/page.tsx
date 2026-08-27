import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { getLocationBySlug, getLocationSlugs } from "@/lib/api/locations";
import { getLocationMetadata } from "@/lib/seo/metadata";
import { hospitalJsonLd } from "@/lib/seo/structured-data";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { OpeningHours } from "@/components/healthcare/OpeningHours";
import { telHref } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function generateStaticParams() {
  return getLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};
  return getLocationMetadata(location, locale);
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  const dict = getContent(locale);

  return (
    <>
      <PageHeader
        title={location.name}
        subtitle={`${location.address}, ${location.city}`}
        eyebrow="Hospital Location"
        image={location.image}
        crumbs={[
          { label: dict.common.nav.home, href: "/" },
          { label: dict.locations.title, href: "/locations" },
          { label: location.name },
        ]}
        locale={locale}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hospitalJsonLd(location)) }}
      />
      <div className="relative h-64 w-full md:h-80">
        <Image src={location.image} alt={location.name} fill sizes="100vw" className="object-cover" priority />
      </div>
      <Container className="grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {location.emergencyAvailable && (
            <Badge variant="warning">{dict.locations.emergencyAvailable}</Badge>
          )}
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              {location.address}, {location.city}, {location.state} {location.postalCode},{" "}
              {location.country}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" aria-hidden />
              <a href={telHref(location.phone)} className="hover:text-primary">
                {location.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" aria-hidden />
              <a href={`mailto:${location.email}`} className="hover:text-primary">
                {location.email}
              </a>
            </li>
          </ul>
          <a
            href={location.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {dict.locations.directions}
          </a>
        </div>

        <Card className="p-6 lg:col-span-1">
          <OpeningHours hours={location.openingHours} title={dict.locations.openingHours} />
        </Card>
      </Container>
    </>
  );
}
