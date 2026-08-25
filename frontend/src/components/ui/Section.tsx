import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Container } from "./Container";
import { Reveal } from "@/components/animations/Reveal";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  containerClassName?: string;
  muted?: boolean;
}

export function Section({
  className,
  containerClassName,
  muted,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("py-12 md:py-20", muted && "bg-muted/50", className)}
      {...props}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
}) {
  return (
    <Reveal
      className={cn(
        "mb-10 max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-start",
      )}
    >
      {eyebrow && (
        <span className="mb-2.5 block text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-[length:var(--text-h2)] font-bold">{title}</h2>
      {description && (
        <p className="mt-3 text-muted-foreground text-[length:var(--text-body)]">{description}</p>
      )}
    </Reveal>
  );
}
