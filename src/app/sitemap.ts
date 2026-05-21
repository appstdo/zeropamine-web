import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/siteConfig";
import { defaultLocale, locales } from "@/i18n/routing";

const localePath = (loc: string) =>
  loc === defaultLocale ? "/" : `/${loc}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const languages: Record<string, string> = Object.fromEntries(
    locales.map((loc) => [loc, absoluteUrl(localePath(loc))])
  );
  languages["x-default"] = absoluteUrl("/");

  return locales.map((loc) => ({
    url: absoluteUrl(localePath(loc)),
    lastModified,
    changeFrequency: "daily",
    priority: loc === defaultLocale ? 1 : 0.9,
    alternates: { languages },
  }));
}
