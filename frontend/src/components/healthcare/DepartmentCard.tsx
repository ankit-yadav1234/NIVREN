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
      <Card className="flex h-full min-h-[240px] flex-col justify-between p-6 sm:p-7 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div>
          <span className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
            <Icon name={department.icon} className="h-[26px] w-[26px]" />
          </span>
          <h3 className="text-[19px] font-semibold tracking-tight text-foreground">{department.name}</h3>
          <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{department.description}</p>
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary">
          Explore Department
          <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1.5 rtl:rotate-180" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
