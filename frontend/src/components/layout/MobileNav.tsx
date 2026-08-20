"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import type { Locale, NavigationItem } from "@/types";
import type { Dictionary } from "@/content/schema";
import { cn } from "@/lib/utils/cn";
import { localePath, telHref } from "@/lib/utils/format";
import { buttonVariants } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function MobileNav({
  items,
  locale,
  dict,
  phone,
}: {
  items: NavigationItem[];
  locale: Locale;
  dict: Dictionary;
  phone: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const pathname = usePathname();

  // Close on route change (render-time reset, no setState-in-effect)
  const [prevPath, setPrevPath] = React.useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // Lock scroll + Escape to close
  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={dict.common.labels.menu}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white hover:bg-white/10"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal={open}
        aria-label="Menu"
        className={cn(
          "fixed inset-y-0 end-0 z-50 flex w-[85%] max-w-sm flex-col bg-card text-card-foreground shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="font-semibold">Menu</span>
          <button
            type="button"
            aria-label={dict.common.labels.closeMenu}
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((item) =>
              item.children?.length ? (
                <li key={item.href}>
                  <button
                    type="button"
                    aria-expanded={expanded === item.href}
                    onClick={() => setExpanded(expanded === item.href ? null : item.href)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-3 text-start text-base font-medium hover:bg-accent"
                  >
                    <span className="truncate">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        expanded === item.href && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {expanded === item.href && (
                    <ul className="ms-3 space-y-0.5 border-s border-border ps-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={localePath(child.href, locale)}
                            className="flex items-start gap-2.5 rounded-md px-2 py-2 hover:bg-accent"
                          >
                            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                              <Icon name={child.icon ?? "Activity"} className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-foreground">{child.label}</span>
                              {child.description && (
                                <span className="line-clamp-1 block text-xs text-muted-foreground">
                                  {child.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={localePath(item.href, locale)}
                    className="block rounded-md px-3 py-3 text-base font-medium hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <Link
            href={localePath("/appointment", locale)}
            className={buttonVariants({ fullWidth: true, className: "uppercase tracking-wide" })}
          >
            {dict.common.actions.bookAppointment}
          </Link>
          <a
            href={telHref(phone)}
            className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {dict.common.actions.callNow}
          </a>
          <Link
            href={localePath("/login", locale)}
            className="block rounded-md px-4 py-2 text-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            {dict.common.actions.signIn}
          </Link>
        </div>
      </div>
    </div>
  );
}
