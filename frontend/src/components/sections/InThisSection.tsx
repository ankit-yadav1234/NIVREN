import type { Locale } from "@/types";
import { inThisSection } from "@/data/inThisSection";
import { Section } from "@/components/ui/Section";
import { IllustrationPanel } from "@/components/ui/IllustrationPanel";
import { BlinkAccordion } from "@/components/ui/BlinkAccordion";
import { Reveal } from "@/components/animations/Reveal";

/**
 * "In This Section" navigation aid: centered heading with a small accent
 * underline, a single tall image on the left, and the shared
 * BlinkAccordion on the right (first item open) linking to related pages.
 */
export function InThisSection({ locale, muted }: { locale: Locale; muted?: boolean }) {
  return (
    <Section muted={muted}>
      <Reveal className="mb-12 text-center">
        <h2 className="text-[length:var(--text-h2)] font-bold text-primary">
          In This Section
        </h2>
        <span className="mx-auto mt-4 block h-[3px] w-12 rounded-full bg-primary" aria-hidden />
      </Reveal>

      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <Reveal>
          <IllustrationPanel
            icon="HeartHandshake"
            tone="secondary"
            src="https://images.unsplash.com/photo-1758691461935-202e2ef6b69f?auto=format&fit=crop&w=1000&q=80"
            alt="Doctor talking with a patient at NIVREN"
            className="aspect-[3/4] w-full"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <BlinkAccordion items={inThisSection} locale={locale} defaultOpenId={inThisSection[0].id} />
        </Reveal>
      </div>
    </Section>
  );
}
