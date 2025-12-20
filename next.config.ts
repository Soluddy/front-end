import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: true,
  turbopack: {},
  experimental: {
    optimizePackageImports: [
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-phantom',
      '@solana/wallet-adapter-solflare',
    ],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty');
    return config;
  },
};

export default nextConfig;
