import { siteConfig } from "@/config/site";
import type { Doctor, FAQ, Location } from "@/types";

/** JSON-LD builders for healthcare-relevant schema.org types. */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
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
