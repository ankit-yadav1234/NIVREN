import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import type { HeroBannerData } from "@/data/heroBanners";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Hero Banner:
 * - When contained: Renders inside <Container> as a rounded, bounded card (used on mid-page strips like Homepage).
 * - When full-bleed (default): 100% full screen viewport height (min-h-[100dvh]).
 * - Desktop (>= md): Exact 50% / 50% split between content side and image side.
 * - Mobile/Tablet (< md): Background image covers 100% full screen with a transparent dark wash overlay on top.
 */
export function HeroBanner({
  data,
  locale,
  className,
  contained = true,
}: {
  data: HeroBannerData;
  locale: Locale;
  className?: string;
  contained?: boolean;
}) {
  const isSchemeLink = /^(tel:|mailto:|https?:)/.test(data.link.href);
  const linkHref = isSchemeLink ? data.link.href : localePath(data.link.href, locale);
  const isImageLeft = data.imageSide === "left";

  const cardContent = (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-transparent text-card-foreground",
        "grid grid-cols-1 md:grid-cols-2 items-stretch min-h-[460px] md:min-h-[520px]",
        className,
      )}
    >
      {/* --- IMAGE BLOCK --- (Stacked on TOP for <= 800px / mobile, 50% column on desktop) */}
      <div
        className={cn(
          "relative w-full overflow-hidden min-h-[280px] sm:min-h-[340px] md:min-h-full",
          // On mobile: image is always order-1 (on top)
          "order-1",
          // On desktop (md:): depends on isImageLeft
          isImageLeft ? "md:order-1" : "md:order-2",
        )}
      >
        {data.image ? (
          <>
            <Image
              src={data.image}
              alt={data.headingBefore + (data.headingAccent || "") + data.headingAfter}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover object-center"
            />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 flex items-center justify-center">
            <div className="text-primary font-semibold text-lg">{data.eyebrow}</div>
          </div>
        )}
      </div>

      {/* --- CONTENT BLOCK --- (Stacked on BOTTOM for <= 800px / mobile, 50% column on desktop) */}
      <div
        className={cn(
          "relative z-10 flex flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 md:px-10 lg:px-14 md:py-14 bg-transparent",
          // On mobile: content is order-2 (below image)
          "order-2",
          // On desktop (md:): depends on isImageLeft
          isImageLeft ? "md:order-2" : "md:order-1",
        )}
      >
        <Reveal>
          {/* Eyebrow / Sub Heading */}
          <div className="mb-3 sm:mb-3.5">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {data.eyebrow}
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-normal leading-[1.18] tracking-tight text-black dark:text-white">
            {data.headingBefore}
            <span className="text-black dark:text-white font-normal">{data.headingAccent}</span>
            {data.headingAfter}
          </h2>

          {/* Description */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base leading-relaxed text-muted-foreground font-normal">
            {data.body}
          </p>

          {/* CTA Link Button */}
          <div className="mt-7 sm:mt-9 flex items-center gap-4">
            <Link
              href={linkHref}
              className="group inline-flex items-center gap-3 border border-primary bg-primary px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all duration-200 hover:bg-primary/90 shadow-md hover:shadow-lg rounded-md"
            >
              <span>{data.link.label}</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5 rtl:rotate-180"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );

  return (
    <section className="py-12 sm:py-16 md:py-20 transition-colors duration-200">
      <Container>{cardContent}</Container>
    </section>
  );
}
