import { createNavigation } from "next-intl/navigation";

export const locales = ["ko", "en", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localePrefix = "always"; //"as-needed";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    locales,
    defaultLocale,
    localePrefix,
  });

export function detectLocale(request: Request): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  // 1️⃣ 첫 번째 언어코드 추출 (예: "en-US,en;q=0.9" → "en-US")
  const raw = acceptLanguage.split(",")[0].trim();

  // 2️⃣ "en-US" → "en"만 추출
  const langCode = raw.split("-")[0].toLowerCase();

  // 3️⃣ 지원하는 로캘(locales) 목록에 있으면 그대로 반환
  if (locales.includes(langCode as Locale)) {
    return langCode;
  }

  // 4️⃣ 없으면 fallback
  return defaultLocale;
}
