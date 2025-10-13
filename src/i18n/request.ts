import { getRequestConfig } from "next-intl/server";
import type { Locale } from "./routing";
import { defaultLocale, locales } from "./routing";

type Messages = {
  common: Record<string, unknown>;
  pomodoro: Record<string, unknown>;
  seo: Record<string, unknown>;
};

async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case "ko":
      return {
        common: (await import("../locales/ko/common.json")).default,
        pomodoro: (await import("../locales/ko/pomodoro.json")).default,
        seo: (await import("../locales/ko/seo.json")).default,
      };
    case "en":
      return {
        common: (await import("../locales/en/common.json")).default,
        pomodoro: (await import("../locales/en/pomodoro.json")).default,
        seo: (await import("../locales/en/seo.json")).default,
      };
    default:
      throw new Error(`Unsupported locale: ${locale}`);
  }
}

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  return {
    locale: safeLocale,
    messages: await loadMessages(safeLocale),
  };
});
