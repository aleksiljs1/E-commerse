import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.125.79.54", "desktop-35mtkeg.tailaf7658.ts.net"],
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
      ],
    },
  ],
};

export default nextConfig;
