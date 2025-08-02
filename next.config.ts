import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Static generation optimizations
  experimental: {
    // Enable static generation for all pages by default
  },
  
  // Build-time optimizations
  generateBuildId: async () => {
    // Generate consistent build ID for better caching
    return `build-${Date.now()}`;
  },
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Static export configuration (uncomment for full static export)
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  
  // Image optimization for Strapi media
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // Add production Strapi URL when available
      // {
      //   protocol: 'https',
      //   hostname: 'your-strapi-domain.com',
      //   pathname: '/uploads/**',
      // }
    ],
  },
  
  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
  },
  
  // Optional: Enable if you want full static export (no server needed)
  // output: 'export',
  // trailingSlash: true,
  
  // Logging for build-time debugging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
