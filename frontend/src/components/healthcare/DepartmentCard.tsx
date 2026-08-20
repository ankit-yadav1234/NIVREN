import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Department, Locale } from "@/types";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { localePath } from "@/lib/utils/format";

export function DepartmentCard({ department, locale }: { department: Department; locale: Locale }) {
  return (
    <Link
      href={localePath(`/departments/${department.slug}`, locale)}
      className="group focus-visible:outline-none"
    >
      <Card className="h-full p-6 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
          <Icon name={department.icon} className="h-6 w-6" />
        </span>
        <h3 className="text-lg font-semibold">{department.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{department.description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {department.name}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
