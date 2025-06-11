import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => [
    {
      source: "/:locale",
      destination: "/:locale/page/1",
    },
    {
      source: "/:locale/topic/:topic",
      destination: "/:locale/topic/:topic/page/1",
    }
  ],
};

export default nextConfig;
