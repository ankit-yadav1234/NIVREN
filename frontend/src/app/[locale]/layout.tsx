import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { inter, roboto, notoDevanagari, notoArabic } from "../fonts";
import type { Locale } from "@/types";
import { getContent } from "@/content";
import { locales, supportedLocales, isLocale } from "@/config/locales";
import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";
import { ThemeProvider, themeInitScript } from "@/providers/ThemeProvider";
import { LocaleProvider } from "@/providers/LocaleProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/animations/PageTransition";
import { organizationJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  description: seoConfig.defaultDescription,
};

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getContent(locale);
  const dir = locales[locale].direction;
  const fontVars = `${inter.variable} ${roboto.variable} ${notoDevanagari.variable} ${notoArabic.variable}`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={fontVars}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <LocaleProvider locale={locale as Locale} dict={dict}>
              <a href="#main" className="skip-link">
                {dict.common.labels.skipToContent}
              </a>
              <Header locale={locale as Locale} />
              <main id="main">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer locale={locale as Locale} />
            </LocaleProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
