import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface Segment {
  text: string;
  /** e.g. "text-primary" to color just this segment's words. */
  className?: string;
}

/**
 * Word-by-word entrance reveal for headlines (each word slides up from
 * behind an overflow-hidden mask, staggered left to right). Accepts either
 * a plain string or multiple colored segments that share one continuous
 * stagger sequence.
 */
export function RevealText({
  text,
  segments,
  as: Tag = "span",
  className,
  baseDelay = 0,
  step = 0.06,
}: {
  text?: string;
  segments?: Segment[];
  as?: React.ElementType;
  className?: string;
  baseDelay?: number;
  step?: number;
}) {
  const resolvedSegments = segments ?? (text ? [{ text }] : []);

  const items = resolvedSegments.flatMap((seg) =>
    seg.text
      .split(" ")
      .filter(Boolean)
      .map((word) => ({ word, className: seg.className })),
  );

  return (
    <Tag className={className}>
      {items.flatMap((item, i) => [
        <span key={`w-${i}`} className={cn("reveal-word-mask", item.className)}>
          <span className="reveal-word-inner" style={{ animationDelay: `${baseDelay + i * step}s` }}>
            {item.word}
          </span>
        </span>,
        i < items.length - 1 ? " " : null,
      ])}
    </Tag>
  );
}
