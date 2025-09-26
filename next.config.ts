import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Force correct root to avoid multiple lockfile inference issues
    root: __dirname,
  },
};

export default nextConfig;
