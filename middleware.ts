import createMiddleware from "next-intl/middleware";
import { defaultLocale, detectLocale, locales } from "./src/i18n/routing";
import { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // 현재 경로가 로캘 prefix를 포함하지 않을 경우
  const pathname = url.pathname;
  const hasLocale = locales.some((locale) => pathname.startsWith(`/${locale}`));

  if (!hasLocale) {
    const locale = detectLocale(request);
    url.pathname = `/${locale}${pathname}`;
    return Response.redirect(url);
  }

  // next-intl 기본 미들웨어 적용
  return createMiddleware({ locales, defaultLocale })(request);
}

// export default createMiddleware({
//   defaultLocale,
//   localePrefix,
//   locales,
// });

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
