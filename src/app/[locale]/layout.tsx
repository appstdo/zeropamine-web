import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/siteConfig";
import { defaultLocale, locales } from "@/i18n/routing";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "seo" });
  const keywordList = t("keywords")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const canonical = locale === defaultLocale ? "/" : `/${locale}`;

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
    openGraph: {
      type: "website",
      locale: t("openGraph.locale"),
      url: siteUrl,
      siteName: t("openGraph.siteName"),
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      images: [
        {
          url: "/og_image.png",
          width: 1200,
          height: 630,
          alt: t("openGraph.siteName"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: t("twitter.site"),
      title: t("twitter.title"),
      description: t("twitter.description"),
      images: ["/og_image.png"],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: t("appleWebApp.title"),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) {
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
