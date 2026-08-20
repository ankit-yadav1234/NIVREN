import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { getServiceBySlug, getServiceSlugs, getServices } from "@/lib/api/services";
import { getServiceMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { IllustrationPanel } from "@/components/ui/IllustrationPanel";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { ServiceCard } from "@/components/healthcare/ServiceCard";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return getServiceMetadata(service);
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const dict = getContent(locale);
  const all = await getServices();
  const related = all.filter((s) => s.category === service.category && s.id !== service.id).slice(0, 3);

  return (
    <>
      <PageHeader
        title={service.title}
        subtitle={service.description}
        crumbs={[
          { label: dict.common.nav.home, href: "/" },
          { label: dict.services.title, href: "/services" },
          { label: service.title },
        ]}
        locale={locale}
      />
      <Container className="py-12">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <IllustrationPanel
            icon={service.icon}
            src={service.image}
            alt={service.title}
            tone="secondary"
            className="aspect-[4/3] w-full"
          />
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-secondary/10 text-secondary">
              <Icon name={service.icon} className="h-7 w-7" />
            </span>
            <Badge variant="outline">
              {dict.services.category}: {service.category}
            </Badge>
            <p className="max-w-2xl text-muted-foreground">{service.description}</p>
            <Link href={localePath("/appointment", locale)} className={cn(buttonVariants(), "uppercase tracking-wide")}>
              {dict.common.actions.bookAppointment}
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 text-xl font-semibold">{dict.services.title}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ServiceCard key={s.id} service={s} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
