import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.64.132.90", "square-office.tail523b20.ts.net"],
  experimental: { dynamicIO: true },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules/,
    };
    return config;
  },
};

export default nextConfig;
