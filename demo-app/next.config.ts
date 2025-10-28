import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  transpilePackages: ['@finatic/client'],
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
