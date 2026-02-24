import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { 
            key: "Access-Control-Allow-Origin", 
            value: process.env.ALLOWED_ORIGINS || "*" 
          },
          { 
            key: "Access-Control-Allow-Methods", 
            value: "GET,POST,PUT,DELETE,OPTIONS" 
          },
          { 
            key: "Access-Control-Allow-Headers", 
            value: "Content-Type, Authorization" 
          },
        ],
      },
    ];
  },
};

export default nextConfig;
