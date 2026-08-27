import type { Metadata } from "next";
import { Target, Eye, Heart } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeading } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";
import { Timeline } from "@/components/sections/Timeline";
import { HighlightSection } from "@/components/sections/Highlight";
import { ContentImageSection } from "@/components/sections/ContentImageSection";
import { InThisSection } from "@/components/sections/InThisSection";
import { VideoBanner } from "@/components/sections/VideoBanner";
import { SimpleTestimonial } from "@/components/sections/SimpleTestimonial";
import { milestones } from "@/data/milestones";
import { highlightSections } from "@/data/highlights";
import { contentImageSections } from "@/data/contentImageSections";
import { testimonials } from "@/data/testimonials";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ locale, title: dict.about.title, description: dict.about.subtitle, path: "/about" });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getContent(locale);
  const t = dict.about;

  return (
    <>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: t.title }]}
        locale={locale}
      />

      <InThisSection locale={locale} />

      <Container id="mission-vision" className="py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg">
            <Target className="h-9 w-9 text-primary" aria-hidden />
            <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-foreground">{t.mission.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.mission.body}</p>
          </Card>
          <Card className="rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg">
            <Eye className="h-9 w-9 text-primary" aria-hidden />
            <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-foreground">{t.vision.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.vision.body}</p>
          </Card>
        </div>
      </Container>

      <Section id="values" muted>
        <SectionHeading eyebrow="Core Values" title={t.values.title} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.values.items.map((v) => (
            <Card key={v.title} className="rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <Heart className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3.5 text-[18px] font-semibold text-foreground">{v.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{v.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Timeline
        milestones={milestones}
        eyebrow="Our Journey"
        title="Two decades of growth, one mission"
        description="From a single clinic to a connected network of specialists — here's how we got here."
        locale={locale}
      />

      <VideoBanner
        src="https://videos.pexels.com/video-files/9573575/9573575-sd_960_506_25fps.mp4"
        alt="NIVREN staff in a hospital corridor"
        title="A day inside NIVREN"
        description="A glimpse of the people and pace behind our connected network of care."
        muted
      />

      {contentImageSections.map((c, i) => (
        <ContentImageSection key={c.id} data={c} muted={i % 2 === 1} />
      ))}

      {testimonials[0] && <SimpleTestimonial id="testimonial" testimonial={testimonials[0]} />}

      {highlightSections.map((h, i) => (
        <HighlightSection key={h.id} data={h} locale={locale} dict={dict} muted={i % 2 === 1} />
      ))}

      <AppointmentCTA dict={dict} locale={locale} />
    </>
  );
}
