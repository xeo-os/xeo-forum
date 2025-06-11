import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => [
    {
      source: "/:locate",
      destination: "/:locate/page/1",
    }
  ]
};

export default nextConfig;
