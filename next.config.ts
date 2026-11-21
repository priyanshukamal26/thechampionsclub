import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 blocks cross-origin dev resources by default. Allow the two
  // loopback hostnames so `next dev` hydrates and hot-reloads whether the
  // browser (or a screenshot tool) opens localhost or 127.0.0.1.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  // Keep the dev overlay out of the clubhouse shell's bottom-left corner.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
