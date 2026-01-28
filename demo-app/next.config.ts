import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  transpilePackages: ['@finatic/client'],
  async redirects() {
    return [{ source: '/settings', destination: '/developer', permanent: false }];
  },
  experimental: {
    esmExternals: 'loose',
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias['@finatic/client'] = path.resolve(__dirname, '../src');
    return config;
  },
};

export default nextConfig;
