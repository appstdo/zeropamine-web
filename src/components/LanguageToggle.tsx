"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { LOCALE_COOKIE, locales } from "@/i18n/routing";

const labels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export function LanguageToggle() {
  const router = useRouter();
  const currentLocale = useLocale() as Locale;
  const [pending, startTransition] = useTransition();

  const change = (locale: Locale) => {
    if (locale === currentLocale) return;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div className="inline-flex items-center gap-3 text-xs sm:text-sm">
      {locales.map((l, i) => (
        <span key={l} className="inline-flex items-center gap-3">
          {i > 0 && <span className="text-gray-500">•</span>}
          <button
            type="button"
            onClick={() => change(l)}
            disabled={pending || l === currentLocale}
            className={
              l === currentLocale
                ? "font-semibold underline underline-offset-4"
                : "opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
            }
          >
            {labels[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
