import Link from "next/link";
import { HeartPulse } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/config/navigation";
import { localePath } from "@/lib/utils/format";
import { localizeNav } from "@/lib/utils/nav";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StickyHeader } from "./StickyHeader";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ locale }: { locale: Locale }) {
  const dict = getContent(locale);
  const { features } = siteConfig;
  const nav = localizeNav(mainNavigation, dict);

  return (
    <StickyHeader>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href={localePath("/", locale)}
          className="inline-flex shrink-0 items-center gap-2 text-lg font-bold whitespace-nowrap text-white"
          aria-label={siteConfig.name}
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" aria-hidden />
          </span>
          <span>{siteConfig.name}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-3 min-[1130px]:gap-6">
          <DesktopNav items={nav} locale={locale} />

          <div className="flex shrink-0 items-center gap-1">
            {features.languageSwitcher && <LanguageSwitcher />}
            {features.themeToggle && <ThemeToggle />}
            {features.appointments && (
              <div className="hidden sm:block">
                <Link
                  href={localePath("/contact", locale)}
                  className={buttonVariants({ size: "sm", className: "uppercase tracking-wide whitespace-nowrap" })}
                >
                  {dict.common.actions.bookAppointment}
                </Link>
              </div>
            )}
            <MobileNav items={nav} locale={locale} dict={dict} phone={siteConfig.phone} />
          </div>
        </div>
      </Container>
    </StickyHeader>
  );
}
