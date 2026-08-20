import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

interface Badge {
  icon: string;
  /** Tailwind position classes, e.g. "left-[8%] top-[15%]". */
  position: string;
  /** Seconds to offset this badge's float cycle so they don't move in sync. */
  delay?: number;
  size?: "sm" | "md";
}

/**
 * Small floating icon cards scattered over a photo — the "tech dashboard
 * over a photo" composition (data/status badges hovering above the scene).
 * Purely decorative; hidden on small screens where there's no room for it
 * to read as anything but clutter.
 */
export function FloatingBadges({ badges, className }: { badges: Badge[]; className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-10 hidden lg:block", className)} aria-hidden>
      {badges.map((b, i) => (
        <span
          key={i}
          className={cn(
            "float-badge absolute inline-flex items-center justify-center rounded-[var(--radius-md)] border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md",
            b.size === "sm" ? "h-10 w-10" : "h-14 w-14",
            b.position,
          )}
          style={{ animationDelay: `${b.delay ?? i * 0.5}s` }}
        >
          <Icon name={b.icon} className={b.size === "sm" ? "h-4 w-4" : "h-6 w-6"} />
        </span>
      ))}
    </div>
  );
}
