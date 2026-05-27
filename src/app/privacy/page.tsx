import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { loadMarkdown } from "@/lib/loadMarkdown";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("common");

  return {
    title: `${t("footer.privacy")} - ZeroPamine`,
    description:
      locale === "ko"
        ? "ZeroPamine 개인정보 처리방침 - 개인정보 수집 및 이용, 보호 조치에 대한 안내"
        : locale === "ja"
          ? "ZeroPamine プライバシーポリシー - 個人情報の収集、利用、保護に関するご案内"
          : "ZeroPamine Privacy Policy - Information about data collection, usage, and protection",
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const content = loadMarkdown("privacy-policy", locale);
  const t = await getTranslations("common");

  const backLabel =
    locale === "ko" ? "홈으로 돌아가기" : locale === "ja" ? "ホームへ戻る" : "Back to Home";

  return (
    <main className="min-h-screen bg-[#20212E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-400 hover:underline mb-6 text-sm sm:text-base"
        >
          ← {backLabel}
        </Link>

        <MarkdownRenderer content={content} darkMode />

        <footer className="mt-12 pt-6 border-t border-gray-700 text-center text-gray-400 text-xs sm:text-sm">
          <div className="space-x-4">
            <Link href="/privacy" className="hover:underline">
              {t("footer.privacy")}
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/terms" className="hover:underline">
              {t("footer.terms")}
            </Link>
          </div>
          <div className="mt-4 flex justify-center">
            <LanguageToggle />
          </div>
        </footer>
      </div>
    </main>
  );
}
