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
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <Image
        src="https://images.unsplash.com/photo-1758873271761-6cfe9b4f000c?auto=format&fit=crop&w=1800&q=80"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.85)_0%,rgba(2,6,23,0.55)_45%,rgba(2,6,23,0.9)_100%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[var(--container-width)] px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Revenue Cycle Management
          </span>
          <h2 className="mx-auto mt-3 max-w-2xl text-[length:var(--text-h2)] font-bold text-white">
            Numbers our RCM partners see
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            The same discipline we bring to our own hospital network, now working for other
            healthcare organizations too.
          </p>
        </Reveal>

        <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <dt className="text-3xl font-bold text-white sm:text-4xl">
                <CountUp value={s.value} delay={0.2 + i * 0.1} />
              </dt>
              <dd className="mt-1.5 text-xs text-white/70 sm:text-sm">{s.label}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
