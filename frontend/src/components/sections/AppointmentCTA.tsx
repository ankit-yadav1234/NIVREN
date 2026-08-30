import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import type { Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { localePath } from "@/lib/utils/format";

export function AppointmentCTA({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.home.appointmentCta;
  return (
    <section id="appointment" className="py-12 md:py-16">
      <Container>
        <div className="relative isolate overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#075985] px-6 py-11 sm:px-10 sm:py-13 md:px-14 md:py-14 text-center text-white shadow-xl">
          {/* Subtle Ambient Lighting */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-white/15 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <Reveal>
              <h2 className="text-[26px] sm:text-[32px] md:text-[34px] lg:text-[36px] font-bold tracking-tight text-white leading-snug">
                {t.title}
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-white/90 font-normal">
                {t.description}
              </p>

              {/* Single Primary Action Button */}
              <div className="mt-8 sm:mt-9 flex justify-center">
                <Link
                  href={localePath("/contact", locale)}
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 shadow-md transition-all duration-200 hover:bg-slate-100 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{t.action}</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5 rtl:rotate-180"
                    aria-hidden
                  />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
