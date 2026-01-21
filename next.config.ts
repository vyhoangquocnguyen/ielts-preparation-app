import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "engnovatewebsitestorage.blob.core.windows.net",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increased from default 1mb to support audio recordings
    },
  },
} as const;

export default nextConfig;
