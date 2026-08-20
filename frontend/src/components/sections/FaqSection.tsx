import type { FAQ as FAQType } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FAQ } from "@/components/healthcare/FAQ";
import { Reveal } from "@/components/animations/Reveal";

export function FaqSection({ faqs, dict }: { faqs: FAQType[]; dict: Dictionary }) {
  if (faqs.length === 0) return null;
  return (
    <Section>
      <SectionHeading title={dict.home.faq.title} description={dict.home.faq.description} />
      <Reveal className="mx-auto max-w-3xl">
        <FAQ faqs={faqs} />
      </Reveal>
    </Section>
  );
}
