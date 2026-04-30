import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable pre-rendering for dynamic auth-dependent pages
  typescript: {
    // Allow build even with type errors for faster iteration
    ignoreBuildErrors: false,
  },
};

export default nextConfig;