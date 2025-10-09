import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zeropamine - 집중력을 위한 뽀모도로 타이머",
  description:
    "아름다운 모래시계 애니메이션과 함께하는 미니멀한 뽀모도로 타이머. 집중 시간과 휴식 시간을 효과적으로 관리하세요.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: "#374151",
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
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
