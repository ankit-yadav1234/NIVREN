import { departments } from "@/data/departments";
import type { Department } from "@/types";
import { local } from "./client";

export function getDepartments(): Promise<Department[]> {
  return local(departments);
}

export function getDepartmentBySlug(slug: string): Promise<Department | undefined> {
  return local(departments.find((d) => d.slug === slug));
}

export function getDepartmentSlugs(): string[] {
  return departments.map((d) => d.slug);
}
