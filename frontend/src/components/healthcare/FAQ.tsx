import type { FAQ as FAQType } from "@/types";
import { Accordion } from "@/components/ui/Accordion";

export function FAQ({ faqs }: { faqs: FAQType[] }) {
  return (
    <Accordion
      items={faqs.map((f) => ({ id: f.id, title: f.question, content: f.answer }))}
    />
  );
}
