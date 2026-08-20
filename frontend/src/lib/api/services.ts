import { services } from "@/data/services";
import type { Service } from "@/types";
import { local } from "./client";

export function getServices(): Promise<Service[]> {
  return local(services);
}

export function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return local(services.find((s) => s.slug === slug));
}

export function getServiceSlugs(): string[] {
  return services.map((s) => s.slug);
}
