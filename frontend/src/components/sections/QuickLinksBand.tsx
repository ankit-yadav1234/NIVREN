import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import { quickLinks } from "@/data/atAGlance";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Inverted dark band paired below MissionGlance. Uses the foreground/
 * background tokens (not `primary`) so it reads as a distinct "ink" panel
 * rather than repeating the brand-blue CTA band used elsewhere on the page,
 * and so it flips sensibly in dark mode (light band on a dark page).
 */
export function QuickLinksBand({ locale }: { locale: Locale }) {
  return (
    <section className="bg-foreground py-14 text-background md:py-16">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-[23px] font-bold leading-snug md:text-[27px] lg:text-[29px]">
              NIVREN helps healthcare organizations get paid faster — and connects our own
              patients with the right care, right when they need it.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="divide-y divide-background/15">
              {quickLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={localePath(link.href, locale)}
                  className={cn(
                    "group/link flex items-center justify-between gap-4 py-3.5 text-base md:text-[17px] font-medium transition-all duration-300 hover:text-cyan-400 hover:translate-x-1",
                    link.muted ? "text-background/55" : "text-background/90",
                  )}
                >
                  <span className="transition-colors duration-300 group-hover/link:text-cyan-400">{link.label}</span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 transition-all duration-300 text-background/70 group-hover/link:text-cyan-400 group-hover/link:translate-x-2 rtl:rotate-180"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
