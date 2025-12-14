import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.matinhomes.ca',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.matinhomes.ca',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
