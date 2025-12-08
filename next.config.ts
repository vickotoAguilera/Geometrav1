<<<<<<< HEAD
import type { NextConfig } from 'next';
=======
import type {NextConfig} from 'next';
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
<<<<<<< HEAD
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Aumentar límite para archivos grandes
    },
  },
=======
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
