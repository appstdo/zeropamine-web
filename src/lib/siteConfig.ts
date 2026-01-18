const fallbackSiteUrl = "https://zeropamine.app";

const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const siteUrl =
  envSiteUrl && /^https?:\/\//i.test(envSiteUrl) ? envSiteUrl : fallbackSiteUrl;

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

export const appStoreUrl = {
  ios: "https://apps.apple.com/app/zeropamine/id6756612361",
  android:
    "https://play.google.com/store/apps/details?id=com.appstdo.zeropamine",
};
