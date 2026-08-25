import Link from "next/link";
import type { Locale, Service } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { localePath } from "@/lib/utils/format";

export function ServiceCard({ service, locale }: { service: Service; locale: Locale }) {
  return (
    <Link
      href={localePath(`/services/${service.slug}`, locale)}
      className="group focus-visible:outline-none"
    >
      <Card className="flex h-full min-h-[220px] flex-col justify-between p-6 sm:p-7 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex h-13 w-13 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
              <Icon name={service.icon} className="h-[26px] w-[26px]" />
            </span>
            <Badge variant="outline">{service.category}</Badge>
          </div>
          <h3 className="text-[19px] font-semibold tracking-tight text-foreground">{service.title}</h3>
          <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{service.description}</p>
        </div>
      </Card>
    </Link>
  );
}
