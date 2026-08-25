import type { Metadata } from "next";
import { Phone, Mail, Ambulance, MapPin } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/animations/Reveal";
import { PageHeader } from "@/components/layout/PageHeader";
import { HospitalInfo } from "@/components/healthcare/HospitalInfo";
import { ContactForm } from "@/components/sections/ContactForm";
import { AppointmentCTA } from "@/components/sections/AppointmentCTA";
import { telHref } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getContent(locale);
  return buildMetadata({ title: dict.contact.title, description: dict.contact.subtitle, path: "/contact" });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getContent(locale);

  const quickContacts = [
    { icon: Phone, label: "Call Us", value: siteConfig.phone, href: telHref(siteConfig.phone) },
    { icon: Mail, label: "Email Us", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    {
      icon: Ambulance,
      label: "Emergency Line",
      value: siteConfig.emergencyPhone,
      href: telHref(siteConfig.emergencyPhone),
      accent: true,
    },
    { icon: MapPin, label: "Visit a Location", value: "Find a hospital near you", href: `/${locale}/locations` },
  ];

  return (
    <>
      <PageHeader
        title={dict.contact.title}
        subtitle="Questions about our RCM services, clinical departments, billing, or partnerships? Our care team is here to support you."
        crumbs={[{ label: dict.common.nav.home, href: "/" }, { label: dict.contact.title }]}
        eyebrow="Get In Touch"
        locale={locale}
      />

      <section className="bg-background [background-image:radial-gradient(ellipse_65%_90%_at_top_right,hsl(var(--primary)/0.18),transparent_65%)] py-12 dark:[background-image:radial-gradient(ellipse_65%_90%_at_top_right,hsl(var(--primary)/0.24),transparent_65%)] md:py-20">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-[length:var(--text-h2)] font-bold text-primary">
              Get in touch with {siteConfig.name}
            </h2>
            <p className="mt-3 text-muted-foreground">{dict.contact.subtitle}</p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <Reveal className="lg:col-span-1">
              <Card className="h-full rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="mb-2 font-semibold text-[18px]">Address</h3>
                <p className="text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
                  12 Wellness Avenue
                  <br />
                  Mumbai, Maharashtra 400001
                  <br />
                  India
                </p>
                <h3 className="mb-2 mt-6 font-semibold text-[18px]">{dict.contact.info.phone}</h3>
                <HospitalInfo dict={dict} />
              </Card>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-2">
              <Card className="rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm">
                <ContactForm dict={dict} />
              </Card>
            </Reveal>
          </div>

          <div className="mt-14 sm:mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickContacts.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.05}>
                <a
                  href={c.href}
                  className="group flex h-full flex-col items-start gap-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <span
                    className={
                      "inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] transition-transform duration-300 group-hover:scale-105 " +
                      (c.accent ? "bg-emergency/10 text-emergency" : "bg-primary/10 text-primary")
                    }
                  >
                    <c.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-foreground">{c.label}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{c.value}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <AppointmentCTA dict={dict} locale={locale} />
    </>
  );
}
