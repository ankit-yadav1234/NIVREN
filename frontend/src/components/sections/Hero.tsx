import Link from "next/link";
import { CalendarPlus, BarChart3, ShieldCheck } from "lucide-react";
import type { Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { localePath } from "@/lib/utils/format";
import { HeroVideo } from "./HeroVideo";
import { CountUp } from "@/components/animations/CountUp";
import { RevealText } from "@/components/animations/RevealText";

interface Stat {
  value: string;
  label: string;
}

/** Looping ambient background video (moving background for the hero). */
const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4";

/** Staggered delays for the entrance reveal. */
const delay = (seconds: number): React.CSSProperties => ({ animationDelay: `${seconds}s` });

export function Hero({
  dict,
  locale,
  stats,
}: {
  dict: Dictionary;
  locale: Locale;
  stats: Stat[];
}) {
  const t = dict.home.hero;
  return (
    <section id="hero" className="relative isolate flex min-h-dvh items-center overflow-hidden bg-slate-950">
      {/* Moving video background */}
      <HeroVideo src={HERO_VIDEO} className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover" />
      {/* Readability overlay: diagonal multi-stop wash + a soft brand-color glow behind the copy */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(2,6,23,0.88)_0%,rgba(3,25,40,0.6)_45%,rgba(2,6,23,0.9)_100%)]"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/3 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[120px]"
      />

      <Container className="relative z-10 py-20 sm:py-24 md:py-28 pt-40 sm:pt-48 md:pt-56">
        <div className="mx-auto max-w-3xl text-center mt-2 sm:mt-4 md:mt-6">
          <span
            style={delay(0.05)}
            className="animate-reveal inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300 backdrop-blur-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
            {t.badge}
          </span>
          <h1 className="mt-6 font-serif text-[length:var(--text-display)] font-medium leading-[1.08] tracking-tight text-white">
            <RevealText
              segments={[{ text: t.title }, { text: t.titleAccent, className: "text-cyan-400 font-serif" }]}
              baseDelay={0.15}
              step={0.05}
            />
          </h1>
          <p
            style={delay(0.3)}
            className="animate-reveal mx-auto mt-5 max-w-xl text-[length:var(--text-body)] text-white/80"
          >
            {t.description}
          </p>
          <div
            style={delay(0.42)}
            className="animate-reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href={localePath("/rcm", locale)}
              className={cn(buttonVariants({ size: "lg" }), "uppercase tracking-wide")}
            >
              <BarChart3 className="h-5 w-5" aria-hidden />
              {t.primaryAction}
            </Link>
            <Link
              href={localePath("/contact", locale)}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              <CalendarPlus className="h-5 w-5" aria-hidden />
              {t.secondaryAction}
            </Link>
          </div>
        </div>

        <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="animate-reveal text-center" style={delay(0.54 + i * 0.1)}>
              <dt className="text-2xl font-bold text-white sm:text-3xl">
                <CountUp value={s.value} delay={0.6 + i * 0.1} />
              </dt>
              <dd className="mt-1 text-xs text-white/70 sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
