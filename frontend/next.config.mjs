import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true, 
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-router-dom$': path.resolve(process.cwd(), 'lib/shims/react-router-dom.tsx'),
      'react-helmet-async$': path.resolve(process.cwd(), 'lib/shims/react-helmet-async.tsx'),
      '@': path.resolve(process.cwd(), './'),
    };
    return config;
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.totan.ai/api';
    return [
      {
        source: '/sitemap.xml',
        destination: `${apiUrl}/sitemap.xml`,
      },
      {
        source: '/sitemap.xsl',
        destination: `${apiUrl}/sitemap.xsl`,
      },
      {
        source: '/sitemaps/:path*',
        destination: `${apiUrl}/sitemaps/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
