import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin"
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless"
          }
        ]
      }
    ];
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js"
      }
    }
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: { test: (s: string) => boolean } }) =>
        rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply default loader for *.svg?url imports
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ["@svgr/webpack"]
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  }
};

export default nextConfig;
