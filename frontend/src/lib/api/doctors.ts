import { doctors } from "@/data/doctors";
import type { Doctor } from "@/types";
import { local } from "./client";

export interface DoctorFilters {
  q?: string;
  department?: string;
  specialty?: string;
  language?: string;
}

export function getDoctors(filters: DoctorFilters = {}): Promise<Doctor[]> {
  let result = doctors;
  const { q, department, specialty, language } = filters;
  if (q) {
    const needle = q.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(needle) ||
        d.specialty.toLowerCase().includes(needle),
    );
  }
  if (department) result = result.filter((d) => d.departmentId === department);
  if (specialty) result = result.filter((d) => d.specialty === specialty);
  if (language) result = result.filter((d) => d.languages.includes(language));
  return local(result);
}

export function getDoctorBySlug(slug: string): Promise<Doctor | undefined> {
  return local(doctors.find((d) => d.slug === slug));
}

export function getDoctorsByDepartment(departmentId: string): Promise<Doctor[]> {
  return local(doctors.filter((d) => d.departmentId === departmentId));
}

export function getDoctorSlugs(): string[] {
  return doctors.map((d) => d.slug);
}

export function getSpecialties(): string[] {
  return Array.from(new Set(doctors.map((d) => d.specialty)));
}

export function getDoctorLanguages(): string[] {
  return Array.from(new Set(doctors.flatMap((d) => d.languages))).sort();
}
