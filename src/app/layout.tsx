import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { siteUrl } from "@/lib/siteConfig";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  userScalable: false,
  themeColor: "black",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo");
  const keywordList = t("keywords")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const tSeo = await getTranslations("seo");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tSeo("jsonLd.name"),
    url: siteUrl,
    applicationCategory: tSeo("jsonLd.applicationCategory"),
    operatingSystem: tSeo("jsonLd.operatingSystem"),
    description: tSeo("jsonLd.description"),
    offers: {
      "@type": "Offer",
      price: tSeo("jsonLd.price"),
      priceCurrency: tSeo("jsonLd.priceCurrency"),
    },
    inLanguage: tSeo("jsonLd.inLanguage"),
  };

  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}
