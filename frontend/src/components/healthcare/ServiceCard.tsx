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
      <Card className="h-full p-6 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-secondary/10 text-secondary">
            <Icon name={service.icon} className="h-6 w-6" />
          </span>
          <Badge variant="outline">{service.category}</Badge>
        </div>
        <h3 className="text-lg font-semibold">{service.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{service.description}</p>
      </Card>
    </Link>
  );
}
