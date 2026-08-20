import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Reveal } from "@/components/animations/Reveal";

export function Testimonials({
  testimonials,
  dict,
}: {
  testimonials: Testimonial[];
  dict: Dictionary;
}) {
  if (testimonials.length === 0) return null;
  return (
    <Section>
      <SectionHeading
        title={dict.home.testimonials.title}
        description={dict.home.testimonials.description}
      />
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.08}>
            <Card className="relative flex h-full flex-col overflow-hidden p-6 transition-shadow duration-300 hover:shadow-lg">
              <Quote
                className="absolute -right-2 -top-2 h-20 w-20 text-primary/[0.06]"
                fill="currentColor"
                aria-hidden
              />
              <div className="relative flex" aria-label={`${t.rating} / 5`}>
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} className="h-4 w-4 fill-warning text-warning" aria-hidden />
                ))}
              </div>
              <p className="relative mt-3 flex-1 text-sm leading-relaxed text-foreground">“{t.quote}”</p>
              <div className="relative mt-5 flex items-center gap-3 border-t border-border pt-4">
                <Avatar src={t.image} name={t.name} size={44} className="ring-2 ring-background" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.name}</p>
                  {t.role && <p className="truncate text-xs text-muted-foreground">{t.role}</p>}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
