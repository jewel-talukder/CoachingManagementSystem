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
  // Ensure production API URL is used in production builds
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'http://93.127.140.63:4000/api' 
        : 'https://localhost:7286/api'),
  },
};

export default nextConfig;
