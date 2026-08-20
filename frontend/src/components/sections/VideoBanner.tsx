import { Section, SectionHeading } from "@/components/ui/Section";
import { IllustrationPanel } from "@/components/ui/IllustrationPanel";
import { Reveal } from "@/components/animations/Reveal";

/** Full-width ambient video banner, e.g. between the timeline and the story sections. */
export function VideoBanner({
  src,
  alt,
  title,
  description,
  muted,
}: {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  muted?: boolean;
}) {
  return (
    <Section muted={muted}>
      {title && <SectionHeading title={title} description={description} />}
      <Reveal>
        <IllustrationPanel icon="Hospital" tone="secondary" videoSrc={src} alt={alt} className="aspect-video w-full" />
      </Reveal>
    </Section>
  );
}
