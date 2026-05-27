import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin the workspace root to this app (a stray lockfile higher up otherwise confuses inference).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
