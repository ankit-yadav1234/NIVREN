import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { cn } from "@/lib/utils/cn";

/**
 * A rounded/shadow/aspect-ratio image (or video) panel. Pass `videoSrc` for
 * a looping ambient clip, or `src` for a static photo; without either it
 * falls back to the original duotone icon-on-gradient placeholder, so
 * existing call sites keep working untouched.
 */
export function IllustrationPanel({
  icon,
  src,
  videoSrc,
  alt = "",
  tone = "primary",
  className,
}: {
  icon: string;
  src?: string;
  videoSrc?: string;
  alt?: string;
  tone?: "primary" | "secondary";
  className?: string;
}) {
  if (videoSrc) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-md transition-transform duration-500 hover:-translate-y-1",
          className,
        )}
      >
        <HeroVideo src={videoSrc} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-md transition-transform duration-500 hover:-translate-y-1",
          className,
        )}
      >
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[var(--radius-lg)] border border-border shadow-md transition-transform duration-500 hover:-translate-y-1",
        tone === "primary"
          ? "bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10"
          : "bg-gradient-to-br from-secondary/15 via-secondary/5 to-primary/10",
        className,
      )}
      aria-hidden
    >
      <Icon name={icon} className={cn("h-10 w-10", tone === "primary" ? "text-primary" : "text-secondary")} />
    </div>
  );
}
