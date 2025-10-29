import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  // External packages for server-side rendering (Next.js 16+)
  // Note: Using Neon serverless driver which is edge-compatible, no need for pg/pg-native
  serverExternalPackages: ['better-auth'],

  // Turbopack configuration (default in Next.js 16)
  turbopack: {
    root: process.cwd(),
  },

  // Allow cross-origin requests from development domains
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://id.nuxt.test',
    'http://nuxt.test',
  ],

  // Note: CORS headers are now handled directly in API route handlers
  // See: /api/auth/[...all]/route.ts for Better Auth CORS
  // See: /api/idp/*/route.ts for IdP endpoint CORS
};

export default withNextIntl(nextConfig);
