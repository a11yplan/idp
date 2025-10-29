import { createStart } from '@tanstack/react-start'
import { authMiddleware } from './middleware/auth.middleware'
import { corsMiddleware } from './middleware/cors.middleware'

/**
 * TanStack Start Configuration
 *
 * Configures global middleware and server-side behavior.
 * This replaces Next.js middleware.ts functionality.
 */
export const startInstance = createStart(() => {
  return {
    // Global request middleware
    // Order matters: CORS first, then auth
    requestMiddleware: [
      corsMiddleware,
      authMiddleware,
    ],

    // Default SSR for all routes (can be overridden per-route)
    defaultSsr: true,
  }
})
