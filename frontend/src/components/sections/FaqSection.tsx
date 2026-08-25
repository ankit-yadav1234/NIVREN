import type { FAQ as FAQType } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Container } from "@/components/ui/Container";
import { FAQ } from "@/components/healthcare/FAQ";
import { Reveal } from "@/components/animations/Reveal";

export function FaqSection({ faqs, dict }: { faqs: FAQType[]; dict: Dictionary }) {
  if (faqs.length === 0) return null;
  return (
    <section className="relative isolate overflow-hidden bg-white py-16 md:py-24">
      {/* Soft cyan gradient wash on top-right only, matching reference image */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 -z-10 h-[620px] w-[620px] bg-[radial-gradient(circle_at_top_right,#daf5fc_0%,#e9f8fd_42%,rgba(255,255,255,0)_75%)]"
      />
      <Container className="relative z-10">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-[length:var(--text-h2)] font-bold text-slate-900">{dict.home.faq.title}</h2>
          <p className="mt-3 text-[length:var(--text-body)] text-slate-600">{dict.home.faq.description}</p>
        </Reveal>
        <Reveal className="mx-auto max-w-5xl">
          <FAQ faqs={faqs} />
        </Reveal>
      </Container>
    </section>
  );
}
