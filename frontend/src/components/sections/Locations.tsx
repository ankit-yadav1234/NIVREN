import type { Location, Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LocationCard } from "@/components/healthcare/LocationCard";
import { Reveal } from "@/components/animations/Reveal";
import { EmptyState } from "@/components/ui/states";

export function Locations({
  locations,
  dict,
  locale,
}: {
  locations: Location[];
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <Section muted>
      <SectionHeading title={dict.home.locations.title} description={dict.home.locations.description} />
      {locations.length === 0 ? (
        <EmptyState title={dict.common.labels.empty} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((l, i) => (
            <Reveal key={l.id} delay={Math.min(i, 5) * 0.08}>
              <LocationCard location={l} locale={locale} dict={dict} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
