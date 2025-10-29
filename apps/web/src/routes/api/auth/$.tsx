import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'

/**
 * Better Auth API Route Handler for TanStack Start
 * Handles all authentication routes: /api/auth/*
 *
 * This wildcard route replaces the Next.js App Router's [...all]/route.ts
 * and handles all Better Auth endpoints:
 * - Sign in/up (email/password and magic link)
 * - Email verification
 * - Password reset
 * - Session management
 * - Organization management
 * - Admin operations
 *
 * CORS headers are already added by corsMiddleware in src/start.ts
 */
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Better Auth handler processes GET requests
        return await auth.handler(request)
      },
      POST: async ({ request }) => {
        // Better Auth handler processes POST requests
        return await auth.handler(request)
      },
      PUT: async ({ request }) => {
        // Better Auth handler processes PUT requests
        return await auth.handler(request)
      },
      DELETE: async ({ request }) => {
        // Better Auth handler processes DELETE requests
        return await auth.handler(request)
      },
      OPTIONS: async ({ request }) => {
        // OPTIONS is handled by corsMiddleware
        // But provide a fallback response
        return new Response(null, { status: 204 })
      },
    },
  },
})
