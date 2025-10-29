import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

/**
 * Router configuration for TanStack Start
 *
 * This router instance controls all routing behavior including:
 * - File-based routing from src/routes/
 * - Scroll restoration
 * - SSR/CSR per-route control
 * - Data loading and caching
 */

// Create singleton router instance
let router: ReturnType<typeof createRouter> | undefined

export function getRouter() {
  if (!router) {
    router = createRouter({
      routeTree,
      defaultPreload: 'intent',
    })
  }

  return router
}

// Infer router type for use in components
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
