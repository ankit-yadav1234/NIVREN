import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { Section } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Reveal } from "@/components/animations/Reveal";

/** A single featured quote — the compact alternative to the homepage's 3-card Testimonials grid. */
export function SimpleTestimonial({ testimonial, muted }: { testimonial: Testimonial; muted?: boolean }) {
  return (
    <Section muted={muted}>
      <Reveal className="mx-auto max-w-2xl text-center">
        <Quote className="mx-auto h-9 w-9 text-primary/30" aria-hidden />
        <div className="mt-3 flex justify-center" aria-label={`${testimonial.rating} / 5`}>
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-warning text-warning" aria-hidden />
          ))}
        </div>
        <p className="mt-4 text-[length:var(--text-h3)] font-semibold leading-snug text-foreground">
          “{testimonial.quote}”
        </p>
        <div className="mx-auto mt-6 flex w-fit items-center gap-3">
          <Avatar src={testimonial.image} name={testimonial.name} size={48} className="ring-2 ring-background" />
          <div className="text-start">
            <p className="text-sm font-semibold">{testimonial.name}</p>
            {testimonial.role && <p className="text-xs text-muted-foreground">{testimonial.role}</p>}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
