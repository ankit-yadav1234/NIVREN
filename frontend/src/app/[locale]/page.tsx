import type { Locale } from "@/types";
import { getContent } from "@/content";
import { getRcmServices } from "@/lib/api/rcm";
import { getTestimonials } from "@/lib/api/content-data";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { heroBanners } from "@/data/heroBanners";
import {
  Hero,
  MissionGlance,
  QuickLinksBand,
  RcmServicesHome,
  Testimonials,
  AppointmentCTA,
  ImpactStrip,
} from "@/components/sections";
import { EmergencyBanner } from "@/components/healthcare/EmergencyBanner";
import { siteConfig } from "@/config/site";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getContent(locale);

  const [rcmServices, testimonials] = await Promise.all([getRcmServices(), getTestimonials()]);

  const stats = [
    { value: "500+", label: "Provider organizations supported" },
    { value: "2.4M+", label: "Claims processed yearly" },
    { value: "99.1%", label: "Coding accuracy" },
    { value: "20+", label: dict.home.stats.years },
  ];

  const { features } = siteConfig;

  return (
    <>
      <Hero dict={dict} locale={locale} stats={stats} />
      {features.emergency && (
        <EmergencyBanner
          title={dict.home.emergency.title}
          description={dict.home.emergency.description}
          action={dict.home.emergency.action}
        />
      )}
      <MissionGlance locale={locale} />
      {heroBanners.map((banner) => (
        <HeroBanner key={banner.id} data={banner} locale={locale} contained />
      ))}
      <QuickLinksBand locale={locale} />
      <ImpactStrip />
      <RcmServicesHome services={rcmServices} locale={locale} limit={5} />
      {features.testimonials && <Testimonials testimonials={testimonials} dict={dict} />}
      <AppointmentCTA dict={dict} locale={locale} />
    </>
  );
}
