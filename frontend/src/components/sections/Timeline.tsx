"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import type { Milestone } from "@/data/milestones";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Vertical scroll-driven timeline. A single scroll listener (rAF-throttled)
 * drives both the progress-line fill and each node's active state from the
 * same "activation line" in the viewport, so the line and the circles it
 * passes always stay visually in sync. Content reveal is pure CSS, keyed off
 * the `.is-active` class this effect toggles (see globals.css).
 */
export function Timeline({
  milestones,
  eyebrow,
  title,
  description,
  locale,
}: {
  milestones: Milestone[];
  eyebrow?: string;
  title: string;
  description?: string;
  locale: Locale;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const fill = fillRef.current;
    if (!wrap || !fill) return;

    const items = Array.from(wrap.querySelectorAll<HTMLLIElement>("[data-timeline-item]"));
    const activationRatio = 0.55; // slightly below viewport center — reads naturally while scrolling down

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fill.style.transform = "scaleY(1)";
      items.forEach((item) => item.classList.add("is-active"));
      return;
    }

    let frame = 0;

    function update() {
      frame = 0;
      const rect = wrap!.getBoundingClientRect();
      const activationY = window.innerHeight * activationRatio;
      const progress = rect.height > 0 ? Math.min(1, Math.max(0, (activationY - rect.top) / rect.height)) : 0;
      fill!.style.transform = `scaleY(${progress})`;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const nodeCenter = itemRect.top + 20; // node is 40px tall, centered near the item's top
        item.classList.toggle("is-active", nodeCenter <= activationY);
      });
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Section id="our-journey">
      {eyebrow && (
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      )}
      <SectionHeading title={title} description={description} />

      <div ref={wrapRef} className="relative mx-auto max-w-4xl">
        <div
          className="pointer-events-none absolute start-[19px] top-0 h-full w-[2px] rounded-full bg-border md:start-1/2 md:ms-[-1px]"
          aria-hidden
        />
        <div
          ref={fillRef}
          className="pointer-events-none absolute start-[19px] top-0 h-full w-[2px] rounded-full bg-primary md:start-1/2 md:ms-[-1px]"
          style={{ transform: "scaleY(0)", transformOrigin: "top" }}
          aria-hidden
        />

        <ol className="relative space-y-10 md:space-y-14">
          {milestones.map((m, i) => {
            const isLeft = i % 2 === 0;
            return (
              <li
                key={m.id}
                data-timeline-item
                className="timeline-item relative flex gap-5 ps-14 md:items-start md:gap-0 md:ps-0"
              >
                <span
                  className="timeline-node absolute start-0 top-0 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-background shadow-sm md:static md:order-2 md:mx-6 lg:mx-10"
                  aria-hidden
                >
                  <Icon name={m.icon} className="h-4 w-4" />
                </span>

                <div
                  className={cn(
                    "timeline-reveal min-w-0 flex-1 md:w-[calc(50%-3.5rem)] md:flex-none",
                    isLeft ? "md:order-1 md:text-end" : "md:order-3",
                  )}
                >
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {m.year}
                  </span>
                  <h2 className="mt-3 text-[length:var(--text-h3)] font-bold text-foreground">{m.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                    {m.description}
                  </p>
                  <Link
                    href={localePath(m.link.href, locale)}
                    className={cn(
                      "mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline",
                      isLeft && "md:flex-row-reverse",
                    )}
                  >
                    {m.link.label}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                  </Link>
                </div>

                <div
                  className={cn("hidden md:block md:w-[calc(50%-3.5rem)] md:flex-none", isLeft ? "md:order-3" : "md:order-1")}
                  aria-hidden
                />
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
