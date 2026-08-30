import Image from "next/image";
import { Reveal } from "@/components/animations/Reveal";
import { CountUp } from "@/components/animations/CountUp";

const STATS = [
  { value: "500+", label: "Provider organizations supported" },
  { value: "2.4M+", label: "Claims processed every year" },
  { value: "99.1%", label: "Coding accuracy rate" },
  { value: "48hr", label: "Average claim turnaround" },
];

/**
 * Full-bleed photo banner with a stat row overlaid — a proof-strip for the
 * RCM side of the business, distinct from the split text/icon HeroBanner
 * pattern used elsewhere on the home page.
 */
export function ImpactStrip() {
  return (
    <section id="impact" className="relative isolate overflow-hidden py-20 sm:py-24 md:py-28 lg:py-32 flex items-center min-h-[540px]">
      <Image
        src="https://images.unsplash.com/photo-1758873271761-6cfe9b4f000c?auto=format&fit=crop&w=1800&q=80"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.85)_0%,rgba(2,6,23,0.6)_45%,rgba(2,6,23,0.9)_100%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[var(--container-width)] px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Revenue Cycle Management
          </span>
          <h2 className="mx-auto mt-4 max-w-3xl text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight text-white tracking-tight drop-shadow-sm">
            Numbers our RCM partners see
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/80 font-normal">
            The same discipline we bring to our own hospital network, now working for other
            healthcare organizations too.
          </p>
        </Reveal>

        <dl className="mx-auto mt-12 sm:mt-16 md:mt-20 grid max-w-5xl grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-14">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="flex flex-col items-center justify-center text-center">
                <dt className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl tracking-tight drop-shadow-md">
                  <CountUp value={s.value} delay={0.2 + i * 0.1} />
                </dt>
                <dd className="mt-2.5 text-xs sm:text-sm font-medium text-white/80 leading-snug drop-shadow-sm">{s.label}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
