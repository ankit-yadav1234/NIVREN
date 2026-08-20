import { HeartPulse } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/animations/Reveal";

/** Shared centered-card layout for /login and /signup. */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-background [background-image:radial-gradient(ellipse_65%_90%_at_top_right,hsl(var(--primary)/0.18),transparent_65%)] px-4 py-16 dark:[background-image:radial-gradient(ellipse_65%_90%_at_top_right,hsl(var(--primary)/0.24),transparent_65%)] md:py-24">
      <div className="w-full max-w-md">
        <Reveal>
          <Card className="p-8">
            <div className="mb-6 text-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary text-primary-foreground">
                <HeartPulse className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-[length:var(--text-h2)] font-bold text-primary">
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
          </Card>
          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </Reveal>
      </div>
    </section>
  );
}
