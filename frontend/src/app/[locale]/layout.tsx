import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { inter, besley, notoDevanagari, notoArabic } from "../fonts";
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
import { AssistantWidget } from "@/components/layout/AssistantWidget";
import { PageTransition } from "@/components/animations/PageTransition";
import { organizationJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  description: seoConfig.defaultDescription,
  // Only emits the <meta name="google-site-verification"> tag once the real
  // code from Search Console is set — never a placeholder.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
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
  const fontVars = `${inter.variable} ${besley.variable} ${notoDevanagari.variable} ${notoArabic.variable}`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={`${fontVars} notranslate`}>
      <head>
        <meta name="google" content="notranslate" />
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          id="organization-jsonld"
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
              <AssistantWidget />
            </LocaleProvider>
          </QueryProvider>
        </ThemeProvider>
        {/* No fake Measurement ID — analytics only loads once a real GA4 ID is configured. */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
