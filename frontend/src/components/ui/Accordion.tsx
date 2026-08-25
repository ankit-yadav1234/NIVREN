"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

/**
 * Minimalist accordion matching modern healthcare design.
 * Features cyan-toned titles, subtle sky-blue dividers, and a sleek rotating '+' icon.
 */
export function Accordion({ items, defaultOpenId }: { items: AccordionItem[]; defaultOpenId?: string }) {
  const [open, setOpen] = React.useState<string>(defaultOpenId ?? items[0]?.id ?? "");
  return (
    <div className="flex w-full flex-col divide-y divide-[#e2eef4]">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div
            key={item.id}
            className="transition-colors duration-200"
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? "" : item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-6 text-start text-lg md:text-xl font-medium text-[#0284a8] hover:text-[#006a88] transition-colors duration-200 group cursor-pointer"
              >
                <span className="leading-snug">{item.title}</span>
                <Plus
                  className={cn(
                    "h-6 w-6 shrink-0 stroke-[1.75] text-[#009ebc] group-hover:text-[#007b94] transition-transform duration-300 ease-out",
                    isOpen && "rotate-45"
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pb-8 pr-12 text-base md:text-lg leading-relaxed text-slate-700">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


