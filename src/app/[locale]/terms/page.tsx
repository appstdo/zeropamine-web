import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { loadMarkdown } from "@/lib/loadMarkdown";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

interface TermsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: `${t("footer.terms")} - ZeroPamine`,
    description:
      locale === "ko"
        ? "ZeroPamine 이용약관 - 서비스 이용에 관한 약관 및 규정"
        : "ZeroPamine Terms of Service - Terms and conditions for using the service",
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;

  // Load the markdown content
  const content = loadMarkdown("terms-of-service", locale);

  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6 text-sm sm:text-base"
        >
          ← {locale === "ko" ? "홈으로 돌아가기" : "Back to Home"}
        </Link>

        {/* Markdown content */}
        <MarkdownRenderer content={content} />

        {/* Footer with links */}
        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          <div className="space-x-4">
            <Link href="/privacy" className="hover:underline">
              {t("footer.privacy")}
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link href="/terms" className="hover:underline">
              {t("footer.terms")}
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
