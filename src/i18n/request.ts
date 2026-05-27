import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import type { Locale } from "./routing";
import { defaultLocale, LOCALE_COOKIE, locales } from "./routing";

type Messages = {
  common: Record<string, unknown>;
  pomodoro: Record<string, unknown>;
  seo: Record<string, unknown>;
  contact: Record<string, unknown>;
};

async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case "ko":
      return {
        common: (await import("../locales/ko/common.json")).default,
        pomodoro: (await import("../locales/ko/pomodoro.json")).default,
        seo: (await import("../locales/ko/seo.json")).default,
        contact: (await import("../locales/ko/contact.json")).default,
      };
    case "en":
      return {
        common: (await import("../locales/en/common.json")).default,
        pomodoro: (await import("../locales/en/pomodoro.json")).default,
        seo: (await import("../locales/en/seo.json")).default,
        contact: (await import("../locales/en/contact.json")).default,
      };
    case "ja":
      return {
        common: (await import("../locales/ja/common.json")).default,
        pomodoro: (await import("../locales/ja/pomodoro.json")).default,
        seo: (await import("../locales/ja/seo.json")).default,
        contact: (await import("../locales/ja/contact.json")).default,
      };
    default:
      throw new Error(`Unsupported locale: ${locale}`);
  }
}

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value as
    | Locale
    | undefined;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const hdrs = await headers();
  const acceptLanguage = hdrs.get("accept-language");
  if (acceptLanguage) {
    const langCode = acceptLanguage
      .split(",")[0]
      .trim()
      .split("-")[0]
      .toLowerCase();
    if (locales.includes(langCode as Locale)) {
      return langCode as Locale;
    }
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: await loadMessages(locale),
  };
});
