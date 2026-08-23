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
            <p className="text-xl font-bold leading-snug md:text-2xl">
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
                    "group/link flex items-center justify-between gap-4 py-4 text-sm font-medium transition-colors duration-300 hover:text-background",
                    link.muted ? "text-background/55" : "text-background/90",
                  )}
                >
                  <span>{link.label}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/link:translate-x-1.5 rtl:rotate-180"
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
