import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev-tunnel hosts (ngrok / cloudflare) to make cross-origin RSC + HMR
  // requests. Without this, Next 16 dev blocks them and returns a truncated
  // response — which ngrok surfaces as ERR_NGROK_3004.
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
    "*.trycloudflare.com",
  ],
  // Allow Server Actions (e.g. add-to-cart) to be invoked through dev tunnels.
  // Without this, Next rejects the POST because the tunnel's Origin/host
  // doesn't match localhost. Wildcards survive rotating tunnel URLs.
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.ngrok-free.app",
        "*.ngrok.app",
        "*.ngrok.io",
        "*.trycloudflare.com",
        "localhost:3000",
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.turn14.com",
      },
      {
        protocol: "https",
        hostname: "turn14.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.graphassets.com",
      },
      {
        protocol: "https",
        hostname: "media.graphassets.com",
      },
      {
        protocol: "https",
        hostname: "uploads-ssl.webflow.com",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;
