import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import { glanceAccordion } from "@/data/atAGlance";
import { Container } from "@/components/ui/Container";
import { BlinkAccordion } from "@/components/ui/BlinkAccordion";
import { Reveal } from "@/components/animations/Reveal";
import { localePath } from "@/lib/utils/format";

/**
 * Soft gradient mission teaser + interactive accordion, paired with
 * QuickLinksBand below. Adapted from a reference layout: eyebrow + serif
 * headline + copy + outlined CTA on the left, a single-open accordion
 * (first item expanded) on the right.
 */
export function MissionGlance({ locale }: { locale: Locale }) {
  return (
    <section className="bg-background [background-image:radial-gradient(ellipse_65%_90%_at_top_right,hsl(var(--primary)/0.18),transparent_65%)] py-12 dark:[background-image:radial-gradient(ellipse_65%_90%_at_top_right,hsl(var(--primary)/0.24),transparent_65%)] md:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground md:text-sm">
              The NIVREN Network at a Glance
            </p>
            <h2 className="mt-4 text-[length:var(--text-h1)] font-bold leading-[1.1] text-primary">
              Revenue cycle expertise, proven on our own hospital network
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
              NIVREN runs a connected network of hospitals and clinics — which means our RCM team
              doesn&apos;t just process claims, they understand how a hospital actually operates.
              That same operational discipline now helps other healthcare organizations collect
              more, faster.
            </p>
            <Link
              href={localePath("/about", locale)}
              className="group mt-7 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-primary transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              About NIVREN
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" aria-hidden />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <BlinkAccordion items={glanceAccordion} locale={locale} defaultOpenId={glanceAccordion[0].id} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
