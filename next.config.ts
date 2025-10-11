import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self'; 
              script-src 'self' 'unsafe-inline' 'unsafe-eval' 
                https://www.googletagmanager.com 
                https://www.google-analytics.com; 
              style-src 'self' 'unsafe-inline'; 
              img-src 'self' data: https:; 
              font-src 'self' data:; 
              connect-src 'self' 
                https://www.google-analytics.com 
                https://analytics.google.com 
                https://www.googletagmanager.com; 
              frame-ancestors 'none';
            `
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
