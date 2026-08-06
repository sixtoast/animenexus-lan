import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Serve the full Lantern SPA from public/index.html at the root
  // while keeping App Router available for gradual React migration.
  async rewrites() {
    return [
      {
        source: "/app",
        destination: "/index.html",
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "**.anilist.co" },
      { protocol: "https", hostname: "**.myanimelist.net" },
    ],
  },
};

export default nextConfig;
