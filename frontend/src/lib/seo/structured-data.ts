import { siteConfig } from "@/config/site";
import type { Doctor, FAQ, Location } from "@/types";

/** JSON-LD builders for healthcare-relevant schema.org types. */

/**
 * NIVREN provides RCM/billing services to other healthcare organizations —
 * it doesn't deliver clinical care on this site, so "ProfessionalService" is
 * the accurate schema.org type here, not "MedicalOrganization" (which
 * schema.org defines for organizations providing direct medical care).
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    // NOTE: siteConfig.social links are currently placeholder homepage URLs
    // (e.g. https://facebook.com, not a real NIVREN profile) — sameAs is
    // deliberately omitted until those point at real NIVREN profiles, since
    // publishing them would be a false business claim in structured data.
  };
}

export function physicianJsonLd(doctor: Doctor) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    medicalSpecialty: doctor.specialty,
    image: `${siteConfig.url}${doctor.image}`,
    knowsLanguage: doctor.languages,
  };
}

export function hospitalJsonLd(location: Location) {
  return {
    "@context": "https://schema.org",
    "@type": "Hospital",
    name: location.name,
    telephone: location.phone,
    email: location.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.postalCode,
      addressCountry: location.country,
    },
  };
}

export function faqJsonLd(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
