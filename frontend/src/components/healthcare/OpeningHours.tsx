import type { OpeningHour } from "@/types";
import { formatOpeningHour } from "@/lib/utils/format";

export function OpeningHours({ hours, title }: { hours: OpeningHour[]; title?: string }) {
  return (
    <div>
      {title && <h3 className="mb-2 text-sm font-semibold">{title}</h3>}
      <ul className="space-y-1 text-sm">
        {hours.map((h) => {
          const { day, hours: label } = formatOpeningHour(h);
          return (
            <li key={h.day} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{day}</span>
              <span className={h.closed ? "text-destructive" : ""}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
