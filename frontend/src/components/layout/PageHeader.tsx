import Image from "next/image";
import type { ReactNode } from "react";
import type { Locale } from "@/types";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { RevealText } from "@/components/animations/RevealText";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  title,
  subtitle,
  crumbs,
  locale,
  image,
  eyebrow,
  className,
  headerAccent,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  locale: Locale;
  image?: string;
  eyebrow?: string;
  className?: string;
  /** Optional decorative element rendered above the title, inside the same
   *  centered hero content — e.g. OrbitAccent on the Contact page. Kept
   *  inside this section (not a sibling after it) so it shares the
   *  section's own min-h-screen height instead of adding a separate block
   *  of page height, and can be absolutely positioned relative to this
   *  section on larger screens. */
  headerAccent?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[100dvh] min-h-screen w-full items-center overflow-hidden border-b border-white/10 bg-slate-950",
        className,
      )}
    >
      {/* --- BACKGROUND / IMAGE LAYER --- */}
      {image ? (
        <>
          {/* Background Image: 100% on mobile, 50% right on desktop */}
          <div className="absolute inset-y-0 inset-x-0 md:left-auto md:right-0 md:w-1/2 h-full w-full -z-20 transition-all duration-500">
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover object-center"
            />
            {/* Subtle edge blend on desktop */}
            <div
              aria-hidden
              className="hidden md:block absolute inset-y-0 left-0 w-24 pointer-events-none z-10 bg-gradient-to-r from-[#031525] to-transparent"
            />
          </div>

          {/* Mobile Transparent Overlay: 100% full screen */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[#020d18]/80 backdrop-blur-[2px] md:hidden"
          />

          {/* Desktop Left 50% Solid/Gradient Backing for Content */}
          <div
            aria-hidden
            className="hidden md:block absolute inset-y-0 left-0 -z-10 w-1/2 bg-gradient-to-br from-[#020b14] via-[#031525] to-[#041c30]"
          />
        </>
      ) : (
        <>
          {/* Rich Dark Healthcare Gradient Background when no image */}
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,rgba(2,6,23,0.96)_0%,rgba(3,25,40,0.86)_50%,rgba(2,6,23,0.96)_100%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:26px_26px]"
          />
        </>
      )}

      {/* Ambient Glows */}
      <div
        aria-hidden
        className="absolute -right-16 top-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-500/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute -left-20 bottom-1/4 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-[100px]"
      />

      {/* Content Container */}
      <Container className="relative z-10 h-full w-full py-24 sm:py-28 md:py-36 pt-32 sm:pt-36 md:pt-44">
        {image ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="w-full text-left max-w-xl md:pr-6">
              {crumbs && crumbs.length > 0 && (
                <div className="mb-4">
                  <Breadcrumbs items={crumbs} locale={locale} variant="dark" />
                </div>
              )}
              {eyebrow && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/50 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-sm">
                    {eyebrow}
                  </span>
                </div>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.12] tracking-tight text-white">
                <RevealText text={title} step={0.045} />
              </h1>
              {subtitle && (
                <p
                  className="animate-reveal mt-4 text-sm sm:text-base md:text-lg font-light leading-relaxed text-white/85"
                  style={{ animationDelay: "0.3s" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <div className="hidden md:block" aria-hidden />
          </div>
        ) : (
          <div className="max-w-3xl text-left">
            {headerAccent}
            {crumbs && crumbs.length > 0 && (
              <div className="mb-4">
                <Breadcrumbs items={crumbs} locale={locale} variant="dark" />
              </div>
            )}
            {eyebrow && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/50 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-sm">
                  {eyebrow}
                </span>
              </div>
            )}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium leading-[1.12] tracking-tight text-white">
              <RevealText text={title} step={0.045} />
            </h1>
            {subtitle && (
              <p
                className="animate-reveal mt-4 max-w-2xl text-sm sm:text-base md:text-lg font-light leading-relaxed text-white/85"
                style={{ animationDelay: "0.3s" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
