/** @type {import('next').NextConfig} */
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  experimental: {
    // allow importing from outside the app directory (monorepo style)
    externalDir: true,
  },
  webpack: config => {
    if (isDev) {
      // In dev, point to the SDK source for hot reload
      config.resolve.alias = {
        ...config.resolve.alias,
        '@finatic/client': path.resolve(__dirname, '../src'),
      };
    }
    return config;
  },
  // Ensure Next transpiles the local package when resolved from node_modules
  transpilePackages: ['@finatic/client'],
};

module.exports = nextConfig;
