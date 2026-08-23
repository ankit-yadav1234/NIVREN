import type { ContentImageSectionData } from "@/data/contentImageSections";
import { Section } from "@/components/ui/Section";
import { IllustrationPanel } from "@/components/ui/IllustrationPanel";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils/cn";

/**
 * Simple two-column teaser: heading + paragraph on one side, a single large
 * image on the other. Pairs with HighlightSection (which adds a checklist +
 * 3-panel gallery) for pages that want a lighter, single-image variant.
 */
export function ContentImageSection({ data, muted }: { data: ContentImageSectionData; muted?: boolean }) {
  const imageFirst = data.imagePosition === "left";

  return (
    <Section id={data.id} muted={muted}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn(!imageFirst && "lg:order-2")}>
          <h2 className="text-[length:var(--text-h2)] font-bold leading-tight text-primary">
            {data.heading}
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{data.body}</p>
        </Reveal>

        <Reveal delay={0.1} className={cn(!imageFirst && "lg:order-1")}>
          <IllustrationPanel icon={data.icon} src={data.image} alt={data.heading} className="aspect-[4/3] w-full" />
        </Reveal>
      </div>
    </Section>
  );
}
