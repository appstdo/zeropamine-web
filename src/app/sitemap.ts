import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          en: "https://zeropamine.com/en",
          ko: "https://zeropamine.com/ko",
        },
      },
    },
  ];

  return routes;
}
