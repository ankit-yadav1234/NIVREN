import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { RevealText } from "@/components/animations/RevealText";
import { FloatingBadges } from "@/components/animations/FloatingBadges";
import { HeroVideo } from "./HeroVideo";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const RCM_VIDEO = "https://videos.pexels.com/video-files/5234541/5234541-sd_640_360_25fps.mp4";

const BADGES = [
  { icon: "Wallet", position: "left-[6%] top-[20%]" },
  { icon: "BarChart3", position: "left-[14%] top-[62%]", delay: 0.8, size: "sm" as const },
  { icon: "ShieldCheck", position: "right-[10%] top-[16%]", delay: 1.4 },
  { icon: "FileCheck", position: "right-[20%] top-[58%]", delay: 0.4, size: "sm" as const },
  { icon: "Receipt", position: "right-[6%] top-[38%]", delay: 2 },
];

/**
 * Video hero for the RCM page: a looping ambient background video with
 * floating status badges (the "tech overlay on footage" look), and a
 * gradient that's a full solid wash on mobile/tablet (nowhere to hide text
 * otherwise) but pulls back to a left-to-right window on desktop so the
 * footage shows through on the right.
 */
export function RcmHero({
  eyebrow,
  title,
  description,
  locale,
}: {
  eyebrow: string;
  title: string;
  description: string;
  locale: Locale;
}) {
  return (
    <section className="relative isolate flex min-h-[100dvh] min-h-screen w-full items-center overflow-hidden bg-slate-950">
      <HeroVideo src={RCM_VIDEO} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      {/* Mobile/tablet: solid wash, full bleed. Desktop: left-to-right window. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-slate-950/88 md:bg-[linear-gradient(100deg,rgba(2,6,23,0.96)_0%,rgba(2,6,23,0.82)_45%,rgba(2,6,23,0.4)_70%,rgba(2,6,23,0.12)_100%)]"
      />

      <FloatingBadges badges={BADGES} />

      <Container className="relative z-10 py-24 sm:py-28 md:py-36 pt-32 sm:pt-36 md:pt-40">
        <div className="max-w-xl text-left">
          <span className="animate-reveal inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300 backdrop-blur-sm">
            {eyebrow}
          </span>
          <h1 className="mt-4 font-serif text-3xl sm:text-5xl md:text-6xl font-medium leading-[1.12] tracking-tight text-white">
            <RevealText text={title} baseDelay={0.12} step={0.05} />
          </h1>
          <p
            className="animate-reveal mt-5 text-sm sm:text-base md:text-lg font-light leading-relaxed text-white/85"
            style={{ animationDelay: "0.35s" }}
          >
            {description}
          </p>
          <div className="animate-reveal mt-8" style={{ animationDelay: "0.5s" }}>
            <Link
              href={localePath("/contact", locale)}
              className={cn(buttonVariants({ size: "lg" }), "uppercase tracking-wide")}
            >
              Get a Free Assessment
              <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
