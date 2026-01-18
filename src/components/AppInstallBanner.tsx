"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { appStoreUrl } from "@/lib/siteConfig";

type Platform = "ios" | "android" | null;

const STORAGE_KEY = "app-install-banner-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;

  const ua = navigator.userAgent.toLowerCase();

  // iOS 감지 (iPhone, iPad, iPod)
  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }

  // Android 감지
  if (/android/.test(ua)) {
    return "android";
  }

  return null;
}

function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent.toLowerCase();

  // 인앱 브라우저 감지 (Facebook, Instagram, KakaoTalk 등)
  return /fban|fbav|instagram|kakaotalk|line|wechat|micromessenger/.test(ua);
}

export function AppInstallBanner() {
  const t = useTranslations("common.appBanner");
  const [platform, setPlatform] = useState<Platform>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const detectedPlatform = detectPlatform();

    // 데스크톱이거나 인앱 브라우저면 표시하지 않음
    if (!detectedPlatform || isInAppBrowser()) {
      return;
    }

    // 이미 닫은 적 있는지 확인
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    setPlatform(detectedPlatform);
    // 약간의 딜레이 후 표시 (UX 개선)
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleInstall = () => {
    if (!platform) return;

    const url = platform === "ios" ? appStoreUrl.ios : appStoreUrl.android;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isVisible || !platform) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="mx-2 mb-2 rounded-xl bg-white shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 p-3">
          {/* 앱 아이콘 */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#20212E] flex items-center justify-center">
            <span className="text-xl font-bold text-white">Z</span>
          </div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {t("title")}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {t("description")}
            </p>
          </div>

          {/* 설치 버튼 */}
          <button
            type="button"
            onClick={handleInstall}
            className="flex-shrink-0 px-4 py-2 bg-[#20212E] text-white text-sm font-medium rounded-lg hover:bg-[#2a2b3d] transition-colors"
          >
            {t("install")}
          </button>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t("close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
