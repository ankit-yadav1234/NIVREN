"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export interface BlinkAccordionItem {
  id: string;
  title: string;
  description: string;
  link: { label: string; href: string };
}

/**
 * Single-open accordion with a continuously-pulsing +/× toggle (see
 * .icon-blink in globals.css) plus its own smooth hover-scale, and a
 * grid-template-rows transition for the open/close reveal. Shared by
 * MissionGlance (homepage) and InThisSection (About page) so both stay in
 * sync instead of drifting apart as separate copies.
 */
export function BlinkAccordion({
  items,
  locale,
  defaultOpenId,
}: {
  items: BlinkAccordionItem[];
  locale: Locale;
  defaultOpenId?: string;
}) {
  const [open, setOpen] = React.useState<string>(defaultOpenId ?? "");

  return (
    <div className="divide-y divide-border">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className="group/row">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? "" : item.id)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] px-3 py-5 text-start text-lg font-medium transition-colors duration-300 hover:text-primary",
                  isOpen ? "text-primary" : "text-foreground",
                )}
              >
                <span>{item.title}</span>
                <span
                  className={cn(
                    "icon-blink inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary transition-transform duration-300 ease-out group-hover/row:scale-110 group-hover/row:border-primary",
                    isOpen && "rotate-45",
                  )}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-3 pb-5 pt-1">
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <Link
                    href={localePath(item.link.href, locale)}
                    className="group/link mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary hover:underline"
                  >
                    {item.link.label}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1 rtl:rotate-180" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
