/**
 * In-page sections the assistant can scroll a user to, keyed by locale-
 * stripped route (e.g. "/about", not "/en/about"). The `id` must match a
 * real DOM element id rendered on that page — see the `id` props added to
 * the corresponding section components in the frontend.
 */

export interface PageSection {
  id: string;
  label: string;
}

export const PAGE_SECTIONS: Record<string, PageSection[]> = {
  "/": [
    { id: "hero", label: "Home Hero & Video Banner" },
    { id: "emergency", label: "Emergency & Urgent Care Banner" },
    { id: "mission-glance", label: "NIVREN Network At A Glance" },
    { id: "impact", label: "RCM Performance & Impact Stats" },
    { id: "rcm-services", label: "Core RCM & Healthcare Services" },
    { id: "testimonials", label: "Client & Patient Testimonials" },
    { id: "appointment", label: "Free Assessment & Consultation CTA" },
  ],
  "/about": [
    { id: "mission-vision", label: "Mission & Vision" },
    { id: "values", label: "Our Values" },
    { id: "our-journey", label: "Timeline / Our Journey" },
    { id: "legacy", label: "Our Legacy" },
    { id: "care-teams", label: "Investing in Our Care Teams" },
    { id: "rcm-support", label: "RCM Support for Other Providers" },
    { id: "testimonial", label: "Testimonial" },
    { id: "care-team", label: "Why Patients Choose Us" },
    { id: "comfort-tech", label: "Facilities & Comfort" },
    { id: "appointment", label: "Book Consultation" },
  ],
  "/services": [
    { id: "service-cards", label: "Clinical & RCM Service Offerings" },
    { id: "appointment", label: "Schedule Service / Consultation" },
  ],
  "/rcm": [
    { id: "rcm-services", label: "End-to-End RCM Capabilities" },
    { id: "appointment", label: "Free Revenue Cycle Assessment" },
  ],
  "/contact": [
    { id: "contact-form", label: "Get In Touch Form & Direct Address" },
    { id: "appointment", label: "Schedule Appointment" },
  ],
};

/** Strips a leading locale segment (e.g. "/en/about" -> "/about") so routes match PAGE_SECTIONS keys. */
export function stripLocale(route: string): string {
  const stripped = route.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

export function sectionsForRoute(route: string): PageSection[] {
  return PAGE_SECTIONS[stripLocale(route)] ?? [];
}
