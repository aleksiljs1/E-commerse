import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.64.132.90", "square-office.tail523b20.ts.net"],
  // @ts-expect-error dynamicIO exists at runtime but lags behind in types
  experimental: { dynamicIO: true },
  cacheComponents: true,
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules/,
    };
    return config;
  },
};

export default nextConfig;
