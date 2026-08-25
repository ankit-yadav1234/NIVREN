import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube, HeartPulse, Phone, Mail, CalendarPlus } from "lucide-react";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { siteConfig } from "@/config/site";
import { footerNavigation } from "@/config/navigation";
import { localePath, telHref } from "@/lib/utils/format";
import { localizeNav } from "@/lib/utils/nav";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";

const socialIcons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube };

export function Footer({ locale }: { locale: Locale }) {
  const dict = getContent(locale);
  const year = new Date().getFullYear();
  const legalLinks = localizeNav(footerNavigation.legal, dict);

  return (
    <footer className="border-t border-border bg-muted/40">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 font-bold text-lg">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HeartPulse className="h-5 w-5" aria-hidden />
              </span>
              {siteConfig.name}
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              {dict.common.footer.tagline} Certified coders, transparent reporting, and a team that
              treats your revenue like it's our own.
            </p>
            <Link
              href={localePath("/contact", locale)}
              className={buttonVariants({ size: "sm", className: "mt-5 uppercase tracking-wide" })}
            >
              <CalendarPlus className="h-4 w-4" aria-hidden />
              {dict.common.actions.bookAppointment}
            </Link>
            <div className="mt-5 flex gap-2">
              {(Object.entries(siteConfig.social) as [keyof typeof socialIcons, string][]).map(
                ([key, url]) => {
                  const Icon = socialIcons[key];
                  if (!Icon || !url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-accent"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  );
                },
              )}
            </div>
          </div>

          <FooterColumn title={dict.common.footer.quickLinks} items={localizeNav(footerNavigation.quickLinks, dict)} locale={locale} />
          <FooterColumn title={dict.common.footer.services} items={footerNavigation.services} locale={locale} />

          <div>
            <h3 className="mb-3 text-sm font-semibold">{dict.common.footer.contactUs}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={telHref(siteConfig.phone)} className="inline-flex items-center gap-2 hover:text-primary">
                  <Phone className="h-4 w-4" aria-hidden /> {siteConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2 hover:text-primary">
                  <Mail className="h-4 w-4" aria-hidden /> {siteConfig.email}
                </a>
              </li>
            </ul>
            <h3 className="mb-3 mt-6 text-sm font-semibold">{dict.common.footer.legal}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link href={localePath(item.href, locale)} className="hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {year} {siteConfig.name}. {dict.common.footer.rights}
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
  locale,
}: {
  title: string;
  items: { label: string; href: string }[];
  locale: Locale;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={localePath(item.href, locale)} className="hover:text-primary">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
