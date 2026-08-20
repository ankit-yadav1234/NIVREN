"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = React.useState<string | null>(null);
  return (
    <div className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-medium hover:text-primary"
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
            </h3>
            {isOpen && (
              <div className="px-5 pb-4 text-sm text-muted-foreground">{item.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
