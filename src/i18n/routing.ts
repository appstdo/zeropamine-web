export const locales = ["ko", "en", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function detectLocale(request: Request): Locale {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(
      new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`)
    );
    const cookieValue = match?.[1] as Locale | undefined;
    if (cookieValue && locales.includes(cookieValue)) {
      return cookieValue;
    }
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  const raw = acceptLanguage.split(",")[0].trim();
  const langCode = raw.split("-")[0].toLowerCase();

  if (locales.includes(langCode as Locale)) {
    return langCode as Locale;
  }

  return defaultLocale;
}
