"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Department } from "@/types";
import type { Dictionary } from "@/content/schema";
import { healthcareConfig } from "@/config/healthcare";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDebounce } from "@/hooks/useDebounce";

export function DoctorSearch({
  departments,
  specialties,
  languages,
  dict,
}: {
  departments: Department[];
  specialties: string[];
  languages: string[];
  dict: Dictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = React.useState(searchParams.get("q") ?? "");
  const debouncedQ = useDebounce(q, 300);

  const setParam = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  React.useEffect(() => {
    if ((searchParams.get("q") ?? "") !== debouncedQ) setParam("q", debouncedQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const cfg = healthcareConfig.doctors;

  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.doctors.searchPlaceholder}
          aria-label={dict.doctors.searchPlaceholder}
          className="ps-9"
        />
      </div>

      {cfg.filterByDepartment && (
        <Select
          aria-label={dict.doctors.filterDepartment}
          value={searchParams.get("department") ?? ""}
          onChange={(e) => setParam("department", e.target.value)}
        >
          <option value="">{dict.doctors.filterDepartment}: {dict.doctors.all}</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      )}

      {cfg.filterBySpecialty && (
        <Select
          aria-label={dict.doctors.filterSpecialty}
          value={searchParams.get("specialty") ?? ""}
          onChange={(e) => setParam("specialty", e.target.value)}
        >
          <option value="">{dict.doctors.filterSpecialty}: {dict.doctors.all}</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      )}

      {cfg.filterByLanguage && (
        <Select
          aria-label={dict.doctors.filterLanguage}
          value={searchParams.get("language") ?? ""}
          onChange={(e) => setParam("language", e.target.value)}
        >
          <option value="">{dict.doctors.filterLanguage}: {dict.doctors.all}</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
