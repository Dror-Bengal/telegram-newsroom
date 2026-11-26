import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  async rewrites() {
    return [{ source: "/media/:name", destination: "http://desk:8000/media/:name" }];
  },
};

export default config;
