import type { Metadata } from "next";
import { Phone, Mail, Ambulance, MapPin } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/animations/Reveal";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { HospitalInfo } from "@/components/healthcare/HospitalInfo";
import { ContactForm } from "@/components/sections/ContactForm";
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
      <HeroBanner
        locale={locale}
        data={{
          id: "contact-hero",
          eyebrow: "Contact",
          headingBefore: "We are here to ",
          headingAccent: "support",
          headingAfter: " you",
          body: "Questions about a visit, billing, or a specific department? Our care team responds to every message within one business day.",
          icon: "HeartHandshake",
          image: "https://images.unsplash.com/photo-1764727291644-5dcb0b1a0375?auto=format&fit=crop&w=1200&q=80",
          link: { label: "Call Us Now", href: telHref(siteConfig.phone) },
          imageSide: "right",
        }}
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
              <Card className="h-full p-6">
                <h3 className="mb-2 font-semibold">Address</h3>
                <p className="text-sm text-muted-foreground">
                  12 Wellness Avenue
                  <br />
                  Mumbai, Maharashtra 400001
                  <br />
                  India
                </p>
                <h3 className="mb-2 mt-6 font-semibold">{dict.contact.info.phone}</h3>
                <HospitalInfo dict={dict} />
              </Card>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-2">
              <Card className="p-6 md:p-8">
                <ContactForm dict={dict} />
              </Card>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickContacts.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.05}>
                <a
                  href={c.href}
                  className="group flex h-full flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <span
                    className={
                      "inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] transition-transform duration-300 group-hover:scale-110 " +
                      (c.accent ? "bg-emergency/10 text-emergency" : "bg-primary/10 text-primary")
                    }
                  >
                    <c.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{c.label}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{c.value}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
