import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper static file handling
  trailingSlash: false,

  // Optimize for production
  compress: true,

  // Handle environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'sixtyoneeighty',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://mojochat.sixtyoneeighty.com',
  },

  // Ensure proper routing
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Handle static file optimization
  images: {
    domains: ['zogbqswwtbqhtubqpogx.supabase.co'],
    unoptimized: true, // For Vercel deployment
  },

  // Enable detailed error messages
  devIndicators: {
    buildActivity: true,
  },

  // ESLint configuration for build
  eslint: {
    ignoreDuringBuilds: false,
  },

  // TypeScript configuration for build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
