import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages for server-side rendering (Next.js 16+)
  // Note: Using Neon serverless driver which is edge-compatible, no need for pg/pg-native
  serverExternalPackages: ['better-auth'],

  // Turbopack configuration (default in Next.js 16)
  turbopack: {
    root: process.cwd(),
  },

  // Note: CORS headers are now handled directly in API route handlers
  // See: /api/auth/[...all]/route.ts for Better Auth CORS
  // See: /api/idp/*/route.ts for IdP endpoint CORS
};

export default nextConfig;
