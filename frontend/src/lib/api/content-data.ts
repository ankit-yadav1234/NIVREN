import { testimonials } from "@/data/testimonials";
import { faqs } from "@/data/faqs";
import { insuranceProviders } from "@/data/insurance";
import type { FAQ, InsuranceProvider, Testimonial } from "@/types";
import { local } from "./client";

export function getTestimonials(): Promise<Testimonial[]> {
  return local(testimonials);
}

export function getFaqs(): Promise<FAQ[]> {
  return local(faqs);
}

export function getInsuranceProviders(): Promise<InsuranceProvider[]> {
  return local(insuranceProviders);
}
