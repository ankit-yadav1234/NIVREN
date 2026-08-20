import { rcmServices } from "@/data/rcmServices";
import type { RcmService } from "@/types";
import { local } from "./client";

export function getRcmServices(): Promise<RcmService[]> {
  return local(rcmServices);
}

export function getRcmServiceBySlug(slug: string): Promise<RcmService | undefined> {
  return local(rcmServices.find((s) => s.slug === slug));
}

export function getRcmServiceSlugs(): string[] {
  return rcmServices.map((s) => s.slug);
}
