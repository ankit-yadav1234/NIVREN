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

  // Duplicate list to achieve continuous seamless loop without jump or blink
  const scrollList = [...testimonials, ...testimonials];

  return (
    <Section id="testimonials" className="overflow-hidden py-16 md:py-24">
      <SectionHeading
        eyebrow="Client & Patient Stories"
        title={dict.home.testimonials.title}
        description={dict.home.testimonials.description}
      />

      {/* Marquee Carousel Container */}
      <div className="relative mt-10 w-full overflow-hidden">
        {/* Soft edge gradient fades */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 md:w-36 bg-gradient-to-r from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 md:w-36 bg-gradient-to-l from-background to-transparent"
        />

        {/* Smooth Auto-Scrolling Ticker Track */}
        <div className="animate-marquee-smooth flex gap-6 py-4">
          {scrollList.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 select-none"
            >
              <Card className="relative flex h-full min-h-[250px] flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
                <Quote
                  className="absolute right-5 top-5 h-6 w-6 text-primary/20"
                  aria-hidden
                />
                <div>
                  <div className="relative flex items-center gap-1" aria-label={`${t.rating} / 5`}>
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                  <p className="relative mt-3.5 text-sm sm:text-[15px] leading-relaxed text-foreground/90 font-normal">
                    “{t.quote}”
                  </p>
                </div>
                <div className="relative mt-6 flex items-center gap-3.5 border-t border-border/70 pt-4">
                  <Avatar src={t.image} name={t.name} size={46} className="ring-2 ring-primary/20" />
                  <div className="min-w-0">
                    <p className="truncate text-sm sm:text-[15px] font-semibold text-foreground">{t.name}</p>
                    {t.role && <p className="truncate text-xs sm:text-[13px] text-muted-foreground">{t.role}</p>}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
