import type { LayoutProps, Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/siteConfig";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LocaleParams = Awaited<LayoutProps<"/[locale]">["params"]>;

export async function generateMetadata({
  params,
}: {
  params: LayoutProps<"/[locale]">["params"];
}): Promise<Metadata> {
  const resolvedParams = (await params) as LocaleParams;
  const locale = resolvedParams.locale as Locale;
  if (!locales.includes(locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "seo" });
  const keywordList = t("keywords")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const canonical = locale === defaultLocale ? "/" : `/${locale as string}`;

  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((loc) => [loc, loc === defaultLocale ? "/" : `/${loc}`])
      ),
    },
    title: {
      default: t("title.default"),
      template: t("title.template"),
    },
    description: t("description"),
    keywords: keywordList,
    themeColor: t("themeColor"),
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    openGraph: {
      // type: t("openGraph.type"),
      locale: t("openGraph.locale"),
      url: siteUrl,
      siteName: t("openGraph.siteName"),
      title: t("openGraph.title"),
      description: t("openGraph.description"),
    },
    twitter: {
      // card: t("twitter.card"),
      site: t("twitter.site"),
      title: t("twitter.title"),
      description: t("twitter.description"),
    },
    appleWebApp: {
      capable: true,
      // statusBarStyle: t("appleWebApp.statusBarStyle"),
      title: t("appleWebApp.title"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const resolvedParams = (await params) as LocaleParams;
  const locale = resolvedParams.locale as Locale;
  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });
  const seoTranslations = await getTranslations({
    locale,
    namespace: "seo",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: seoTranslations("jsonLd.name"),
    url: siteUrl,
    applicationCategory: seoTranslations("jsonLd.applicationCategory"),
    operatingSystem: seoTranslations("jsonLd.operatingSystem"),
    description: seoTranslations("jsonLd.description"),
    offers: {
      "@type": "Offer",
      price: seoTranslations("jsonLd.price"),
      priceCurrency: seoTranslations("jsonLd.priceCurrency"),
    },
    inLanguage: seoTranslations("jsonLd.inLanguage"),
  };

  return (
    <>
      <Script
        id="zeropamine-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>

      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>

      <GoogleAnalytics
        gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string}
      />
    </>
  );
}
