import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * CSS-based entrance animations. They honor prefers-reduced-motion via the
 * global stylesheet (durations collapse to ~0). No JS/observer overhead.
 */
export function FadeIn({
  className,
  delay,
  as: Tag = "div",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { delay?: number; as?: React.ElementType }) {
  return (
    <Tag
      className={cn("animate-fade-in", className)}
      style={{ animationDelay: delay ? `${delay}s` : undefined, ...props.style }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function SlideUp({
  className,
  delay,
  as: Tag = "div",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { delay?: number; as?: React.ElementType }) {
  return (
    <Tag
      className={cn("animate-slide-up", className)}
      style={{ animationDelay: delay ? `${delay}s` : undefined, ...props.style }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** Staggers direct children by applying incremental animation delays. */
export function Stagger({
  className,
  step = 0.08,
  children,
}: {
  className?: string;
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
              style: {
                ...(child.props as { style?: React.CSSProperties }).style,
                animationDelay: `${i * step}s`,
              },
            })
          : child,
      )}
    </div>
  );
}
