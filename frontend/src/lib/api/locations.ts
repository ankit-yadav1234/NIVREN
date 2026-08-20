import { locations } from "@/data/locations";
import type { Location } from "@/types";
import { local } from "./client";

export function getLocations(): Promise<Location[]> {
  return local(locations);
}

export function getLocationBySlug(slug: string): Promise<Location | undefined> {
  return local(locations.find((l) => l.slug === slug));
}

export function getLocationSlugs(): string[] {
  return locations.map((l) => l.slug);
}
