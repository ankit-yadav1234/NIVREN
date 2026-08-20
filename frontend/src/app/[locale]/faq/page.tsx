import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFaqs } from "@/lib/api/content-data";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { FAQ } from "@/components/healthcare/FAQ";
import { EmptyState } from "@/components/ui/states";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ title: dict.faq.title, description: dict.faq.subtitle, path: "/faq" });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getContent(locale);
  const faqs = await getFaqs();

  return (
    <>
      <PageHeader
        title={dict.faq.title}
        subtitle={dict.faq.subtitle}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: dict.faq.title }]}
        locale={locale}
      />
      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          {faqs.length === 0 ? <EmptyState title={dict.common.labels.empty} /> : <FAQ faqs={faqs} />}
        </div>
      </Container>
    </>
  );
}
