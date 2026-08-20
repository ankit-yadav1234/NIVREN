import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/types";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  locale,
  variant = "light",
}: {
  items: Crumb[];
  locale: Locale;
  /** "dark" for use over a dark hero band (e.g. PageHeader). */
  variant?: "light" | "dark";
}) {
  const dark = variant === "dark";
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm", dark ? "text-white/60" : "text-muted-foreground")}>
        {items.map((crumb, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {crumb.href && !last ? (
                <Link href={localePath(crumb.href, locale)} className={dark ? "hover:text-white" : "hover:text-primary"}>
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? (dark ? "text-white" : "text-foreground") : ""}
                >
                  {crumb.label}
                </span>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
