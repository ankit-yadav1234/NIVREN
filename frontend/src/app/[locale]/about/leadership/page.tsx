import type { Metadata } from "next";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { leadershipTeam } from "@/data/leadership";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeadershipGrid } from "@/components/sections/LeadershipGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: "Leadership",
    description: "The team leading NIVREN's revenue cycle operations, compliance, and client success.",
    path: "/about/leadership",
  });
}

export default async function LeadershipPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getContent(locale);

  return (
    <>
      <PageHeader
        title="Leadership"
        subtitle="The people responsible for how your claims actually get handled — not just a name on a page."
        crumbs={[
          { label: dict.common.nav.home, href: "/" },
          { label: dict.common.nav.about, href: "/about" },
          { label: "Leadership" },
        ]}
        locale={locale}
      />

      <Container className="py-12">
        <LeadershipGrid members={leadershipTeam} />
      </Container>
    </>
  );
}
