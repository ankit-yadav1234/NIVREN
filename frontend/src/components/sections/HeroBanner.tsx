import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import type { HeroBannerData } from "@/data/heroBanners";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/animations/Reveal";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Full-bleed hero strip: a dark text panel on one side, a full-height
 * illustrated "image" filling the entire other half (edge-to-edge, no
 * card/rounding) — the closest honest stand-in for a real photo banner
 * given this project has no photography yet.
 */
export function HeroBanner({ data, locale }: { data: HeroBannerData; locale: Locale }) {
  const imageFirst = data.imageSide === "left";
  const isSchemeLink = /^(tel:|mailto:|https?:)/.test(data.link.href);
  const linkHref = isSchemeLink ? data.link.href : localePath(data.link.href, locale);

  return (
    <section className="flex min-h-[26rem] flex-col md:flex-row">
      <div
        className={cn(
          "flex flex-col justify-center gap-4 bg-foreground p-10 text-background md:w-1/2 md:p-16",
          imageFirst ? "md:order-2" : "md:order-1",
        )}
      >
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-background/60 md:text-sm">
            {data.eyebrow}
          </p>
          <h2 className="mt-3 text-[length:var(--text-h2)] font-bold leading-tight">
            {data.headingBefore}
            <em className="text-primary not-italic md:italic">{data.headingAccent}</em>
            {data.headingAfter}
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-background/75">{data.body}</p>
          <Link
            href={linkHref}
            className="group mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-background transition-transform duration-300 hover:translate-x-1"
          >
            {data.link.label}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" aria-hidden />
          </Link>
        </Reveal>
      </div>

      <div
        className={cn(
          "relative flex min-h-[16rem] items-center justify-center overflow-hidden md:w-1/2",
          !data.image && "bg-gradient-to-br from-primary via-primary/85 to-secondary",
          imageFirst ? "md:order-1" : "md:order-2",
        )}
        aria-hidden
      >
        {data.image ? (
          <Image src={data.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,hsl(var(--primary-foreground)/0.18),transparent_55%)]" />
            <Icon name={data.icon} className="relative h-24 w-24 text-primary-foreground/90 md:h-32 md:w-32" />
          </>
        )}
      </div>
    </section>
  );
}
