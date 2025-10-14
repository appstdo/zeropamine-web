import createMiddleware from "next-intl/middleware";
import {
  defaultLocale,
  detectLocale,
  Locale,
  locales,
} from "./src/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

// next-intl 미들웨어는 1회 생성 후 재사용
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // localePrefix: "as-needed" 를 routing 설정에서 관리 중이라면 생략
});

// export default async function middleware(request: NextRequest) {
//   const url = request.nextUrl;

//   // 현재 경로가 로캘 prefix를 포함하지 않을 경우
//   const pathname = url.pathname;
//   const hasLocale = locales.some((locale) => pathname.startsWith(`/${locale}`));

//   if (!hasLocale) {
//     const locale = detectLocale(request);
//     url.pathname = `/${locale}${pathname}`;
//     return NextResponse.redirect(url);
//   }

//   // next-intl 기본 미들웨어 적용
//   return createMiddleware({ locales, defaultLocale })(request);
// }

export default function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // 이미 로캘 프리픽스가 있으면 next-intl 기본 미들웨어로 처리
  const hasLocalePrefix = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocalePrefix) return intlMiddleware(request);

  // 로캘 감지
  const detected = detectLocale(request);
  const safeLocale = locales.includes(detected as Locale)
    ? detected
    : defaultLocale;

  // as-needed: 기본 로캘이면 접두사 없이 그대로 통과
  if (safeLocale === defaultLocale) {
    return intlMiddleware(request);
  }

  // 비-기본 로캘만 접두사 붙여 리다이렉트
  const url = nextUrl.clone();
  url.pathname = `/${safeLocale}${pathname}`;
  return NextResponse.redirect(url);
}

// export default createMiddleware({
//   defaultLocale,
//   localePrefix,
//   locales,
// });

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*|api).*)"],
};
