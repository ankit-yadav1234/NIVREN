import type { Locale } from "@/types";
import { getContent } from "@/content";
import { getDepartments } from "@/lib/api/departments";
import { getDoctors } from "@/lib/api/doctors";
import { getServices } from "@/lib/api/services";
import { getLocations } from "@/lib/api/locations";
import { getTestimonials, getFaqs } from "@/lib/api/content-data";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { heroBanners } from "@/data/heroBanners";
import {
  Hero,
  MissionGlance,
  QuickLinksBand,
  Departments,
  Doctors,
  Services,
  Testimonials,
  AppointmentCTA,
  Locations,
  FaqSection,
  Contact,
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

  const [departments, doctors, services, locations, testimonials, faqs] = await Promise.all([
    getDepartments(),
    getDoctors(),
    getServices(),
    getLocations(),
    getTestimonials(),
    getFaqs(),
  ]);

  const stats = [
    { value: "50k+", label: dict.home.stats.patients },
    { value: `${doctors.length}+`, label: dict.home.stats.doctors },
    { value: `${departments.length}+`, label: dict.home.stats.departments },
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
      <QuickLinksBand locale={locale} />
      {heroBanners.map((banner) => (
        <HeroBanner key={banner.id} data={banner} locale={locale} />
      ))}
      <Departments departments={departments} dict={dict} locale={locale} limit={6} />
      {features.doctorSearch && <Doctors doctors={doctors} dict={dict} locale={locale} limit={4} />}
      <Services services={services} dict={dict} locale={locale} limit={6} />
      {features.testimonials && <Testimonials testimonials={testimonials} dict={dict} />}
      <AppointmentCTA dict={dict} locale={locale} />
      {features.locations && <Locations locations={locations} dict={dict} locale={locale} />}
      {features.faq && <FaqSection faqs={faqs} dict={dict} />}
      <Contact dict={dict} />
    </>
  );
}
