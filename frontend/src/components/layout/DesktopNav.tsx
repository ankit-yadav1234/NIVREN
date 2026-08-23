"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Locale, NavigationItem } from "@/types";
import { cn } from "@/lib/utils/cn";
import { localePath } from "@/lib/utils/format";
import { Icon } from "@/components/ui/Icon";

function isActive(pathname: string, href: string, locale: Locale) {
  const target = localePath(href, locale);
  if (href === "/") return pathname === target;
  return pathname === target || pathname.startsWith(`${target}/`);
}

function NavItemWithDropdown({
  item,
  locale,
  pathname,
}: {
  item: NavigationItem;
  locale: Locale;
  pathname: string;
}) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = `menu-${item.href.replace(/\W+/g, "-")}`;

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <li
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-2 text-sm font-medium transition-colors hover:text-white min-[1130px]:px-3",
          isActive(pathname, item.href, locale) ? "text-white" : "text-white/80",
        )}
      >
        {item.label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <ul
        id={menuId}
        className={cn(
          "absolute start-0 top-full z-50 mt-1 grid w-[min(90vw,560px)] grid-cols-1 gap-1 rounded-[var(--radius-lg)] border border-border bg-card p-2 shadow-lg transition sm:grid-cols-2",
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1",
        )}
      >
        {item.children!.map((child) => (
          <li key={child.href}>
            <Link
              href={localePath(child.href, locale)}
              className={cn(
                "flex items-start gap-3 rounded-md p-2.5 text-start transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive(pathname, child.href, locale) && "bg-accent/60",
              )}
            >
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                <Icon name={child.icon ?? "Activity"} className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-sm font-semibold text-foreground",
                    isActive(pathname, child.href, locale) && "text-primary",
                  )}
                >
                  {child.label}
                </span>
                {child.description && (
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                    {child.description}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function DesktopNav({
  items,
  locale,
}: {
  items: NavigationItem[];
  locale: Locale;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-0.5 min-[1130px]:gap-1">
        {items.map((item) =>
          item.children?.length ? (
            <NavItemWithDropdown key={item.href} item={item} locale={locale} pathname={pathname} />
          ) : (
            <li key={item.href}>
              <Link
                href={localePath(item.href, locale)}
                className={cn(
                  "inline-block whitespace-nowrap rounded-md px-1.5 py-2 text-sm font-medium transition-colors hover:text-white min-[1130px]:px-3",
                  isActive(pathname, item.href, locale) ? "text-white" : "text-white/80",
                )}
              >
                {item.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
