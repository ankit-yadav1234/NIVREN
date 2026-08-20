import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import type { HighlightSectionData } from "@/data/highlights";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { IllustrationPanel } from "@/components/ui/IllustrationPanel";
import { Reveal } from "@/components/animations/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { localePath } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function HighlightSection({
  data,
  locale,
  dict,
  muted,
}: {
  data: HighlightSectionData;
  locale: Locale;
  dict: Dictionary;
  muted?: boolean;
}) {
  const imageFirst = data.imagePosition === "left";

  return (
    <Section muted={muted}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn(!imageFirst && "lg:order-2")}>
          <div className="grid grid-cols-2 gap-4">
            <IllustrationPanel icon={data.icon} src={data.image} alt={data.title} className="col-span-2 aspect-[16/10]" />
            <IllustrationPanel icon={data.accentIcons[0]} tone="secondary" className="aspect-square" />
            <IllustrationPanel icon={data.accentIcons[1]} tone="secondary" className="aspect-square" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className={cn(!imageFirst && "lg:order-1")}>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
            <Icon name={data.icon} className="h-5 w-5" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">{data.eyebrow}</p>
          <h2 className="mt-2 text-[length:var(--text-h2)] font-bold text-foreground">{data.title}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{data.description}</p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {data.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="text-foreground">{point}</span>
              </li>
            ))}
          </ul>

          <Link
            href={localePath("/appointment", locale)}
            className={cn(buttonVariants({ variant: "outline" }), "mt-7 uppercase tracking-wide")}
          >
            {dict.common.actions.bookAppointment}
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
