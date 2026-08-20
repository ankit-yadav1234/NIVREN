"use client";

import * as React from "react";
import type { Department, Doctor, Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/animations/Reveal";
import { DoctorMiniCard } from "@/components/healthcare/DoctorMiniCard";
import { DoctorDetailDrawer } from "@/components/healthcare/DoctorDetailDrawer";

/**
 * Doctors grouped by department, each as its own card-grid section.
 * Clicking a doctor opens a shared slide-over with their full detail instead
 * of navigating away — see DoctorDetailDrawer.
 */
export function DepartmentDoctorDirectory({
  departments,
  doctors,
  locale,
  dict,
}: {
  departments: Department[];
  doctors: Doctor[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [selected, setSelected] = React.useState<Doctor | null>(null);

  const byDepartment = React.useMemo(() => {
    return departments
      .map((dept) => ({ department: dept, doctors: doctors.filter((d) => d.departmentId === dept.id) }))
      .filter((group) => group.doctors.length > 0);
  }, [departments, doctors]);

  return (
    <div className="space-y-12">
      {byDepartment.map(({ department, doctors: deptDoctors }) => (
        <Reveal key={department.id}>
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
              <Icon name={department.icon} className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold">{department.name}</h3>
              <p className="text-xs text-muted-foreground">
                {deptDoctors.length} {deptDoctors.length === 1 ? "specialist" : "specialists"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
            {deptDoctors.map((doctor) => (
              <DoctorMiniCard key={doctor.id} doctor={doctor} onSelect={() => setSelected(doctor)} />
            ))}
          </div>
        </Reveal>
      ))}

      <DoctorDetailDrawer doctor={selected} onClose={() => setSelected(null)} locale={locale} dict={dict} />
    </div>
  );
}
