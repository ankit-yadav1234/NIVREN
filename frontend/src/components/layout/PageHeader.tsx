import type { Locale } from "@/types";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { RevealText } from "@/components/animations/RevealText";

export function PageHeader({
  title,
  subtitle,
  crumbs,
  locale,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  locale: Locale;
}) {
  return (
    <div className="relative isolate overflow-hidden border-b border-white/10 bg-slate-950 pt-16 shadow-[0_1px_0_rgba(255,255,255,0.06)]">
      {/* Diagonal wash + dot-grid texture + two brand-color glows, so every
          inner page opens with the same premium feel — and a border-b that
          always draws a visible seam under this section, in light or dark
          mode, no matter what color the next section happens to be. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,rgba(2,6,23,0.96)_0%,rgba(3,25,40,0.86)_50%,rgba(2,6,23,0.96)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:26px_26px]"
      />
      <div
        aria-hidden
        className="absolute -right-16 top-0 -z-10 h-64 w-64 rounded-full bg-primary/25 blur-[100px]"
      />
      <div
        aria-hidden
        className="absolute -left-20 bottom-0 -z-10 h-56 w-56 rounded-full bg-secondary/20 blur-[100px]"
      />
      <Container className="relative z-10 py-14 md:py-20">
        {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} locale={locale} variant="dark" />}
        <h1 className="text-[length:var(--text-h1)] font-bold text-white">
          <RevealText text={title} step={0.045} />
        </h1>
        {subtitle && (
          <p className="animate-reveal mt-3 max-w-2xl text-[length:var(--text-body)] text-white/70" style={{ animationDelay: "0.3s" }}>
            {subtitle}
          </p>
        )}
      </Container>
    </div>
  );
}
