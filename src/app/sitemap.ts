import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
