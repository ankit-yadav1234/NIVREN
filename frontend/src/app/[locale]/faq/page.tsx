import type { Metadata } from "next";
import Script from "next/script";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFaqs } from "@/lib/api/content-data";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";
import { FAQ } from "@/components/healthcare/FAQ";
import { EmptyState } from "@/components/ui/states";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ locale, title: dict.faq.title, description: dict.faq.subtitle, path: "/faq" });
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
      {faqs.length > 0 && (
        <Script
          id="faq-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        />
      )}
      <PageHeader
        title={dict.faq.title}
        subtitle={dict.faq.subtitle}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: dict.faq.title }]}
        locale={locale}
      />
      <div className="relative isolate overflow-hidden bg-background">
        {/* Soft cyan gradient wash on top-right only */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 -z-10 h-[620px] w-[620px] bg-[radial-gradient(circle_at_top_right,#daf5fc_0%,#e9f8fd_42%,rgba(255,255,255,0)_75%)]"
        />
        <Container className="relative z-10 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            {faqs.length === 0 ? <EmptyState title={dict.common.labels.empty} /> : <FAQ faqs={faqs} />}
          </div>
        </Container>
      </div>
      <AppointmentCTA dict={dict} locale={locale} />
    </>
  );
}
