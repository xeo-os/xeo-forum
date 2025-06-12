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
    },
    {
      source: "/:locale/post/:postId/:postSlug",
      destination: "/:locale/post/:postId/:postSlug/page/1",
    }
  ],
  redirects: async () => [
    {
      source: "/:locale/page/1",
      destination: "/:locale",
      permanent: true,
    },
    {
      source: "/:locale/topic/:topic/page/1",
      destination: "/:locale/topic/:topic",
      permanent: true,
    },
    {
      source: "/:locale/post/:postId/:postSlug/page/1",
      destination: "/:locale/post/:postId/:postSlug",
      permanent: true,
    }
  ],
};

export default nextConfig;
