import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { siteUrl } from "@/lib/siteConfig";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "zeropamine - 집중력을 위한 뽀모도로 타이머",
    template: "%s | zeropamine",
  },
  description:
    "zeropamine은 모래시계와 커피 테마 비주얼을 제공하는 뽀모도로 타이머로, 집중 시간과 휴식 시간을 손쉽게 관리할 수 있도록 도와줍니다.",
  keywords: [
    "뽀모도로",
    "pomodoro timer",
    "집중력 향상",
    "생산성",
    "타이머",
    "zeropamine",
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: "#374151",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "zeropamine",
    title: "zeropamine - 집중력을 위한 뽀모도로 타이머",
    description:
      "모래시계 애니메이션과 함께 집중과 휴식을 관리하세요. zeropamine은 생산성을 높여주는 뽀모도로 타이머입니다.",
  },
  twitter: {
    card: "summary",
    site: "@zeropamine",
    title: "zeropamine - 집중력을 위한 뽀모도로 타이머",
    description:
      "zeropamine은 집중력 향상을 위한 모던한 뽀모도로 타이머입니다.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zeropamine",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "zeropamine Pomodoro Timer",
    url: siteUrl,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description:
      "zeropamine은 모래시계 애니메이션과 커피 테마를 제공하는 뽀모도로 타이머로, 집중과 휴식 주기를 스마트하게 관리할 수 있습니다.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    inLanguage: "ko",
  };

  return (
    <html lang="ko">
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
        {children}
      </body>
      <GoogleAnalytics
        gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string}
      />
    </html>
  );
}
