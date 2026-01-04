import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for IIS with Node.js (RECOMMENDED - works perfectly!)
  // This creates a self-contained Node.js app that works with IIS + iisnode
  output: 'standalone',
  // Disable image optimization
  images: {
    unoptimized: true,
  },
  // Trailing slash for better IIS compatibility
  trailingSlash: true,
};

export default nextConfig;
