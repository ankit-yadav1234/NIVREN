import Link from "next/link";
import { CalendarPlus, Phone } from "lucide-react";
import type { Locale } from "@/types";
import type { Dictionary } from "@/content/schema";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { localePath, telHref } from "@/lib/utils/format";

export function AppointmentCTA({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.home.appointmentCta;
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="rounded-[var(--radius-xl)] bg-primary px-6 py-12 text-center text-primary-foreground md:px-12">
          <h2 className="text-[length:var(--text-h2)] font-bold">{t.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">{t.description}</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={localePath("/appointment", locale)}
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "uppercase tracking-wide")}
            >
              <CalendarPlus className="h-5 w-5" aria-hidden />
              {t.action}
            </Link>
            <a
              href={telHref(siteConfig.phone)}
              className="inline-flex h-13 items-center gap-2 rounded-[var(--radius-md)] border border-primary-foreground/30 px-7 text-base font-semibold hover:bg-primary-foreground/10"
            >
              <Phone className="h-5 w-5" aria-hidden />
              {dict.common.actions.callNow}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
