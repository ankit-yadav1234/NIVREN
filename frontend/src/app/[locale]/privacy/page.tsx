import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { privacySections } from "@/data/legalContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ title: dict.common.nav.privacyPolicy, path: "/privacy" });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getContent(locale);
  const title = dict.common.nav.privacyPolicy;
  return (
    <>
      <PageHeader
        title={title}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: title }]}
        locale={locale}
      />
      <Container className="max-w-3xl space-y-8 py-12">
        {privacySections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold">{s.heading}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </Container>
    </>
  );
}
