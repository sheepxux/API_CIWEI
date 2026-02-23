import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@api-ciwei/scanner"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
};

export default nextConfig;
