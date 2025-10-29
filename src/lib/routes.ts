/**
 * Route Configuration
 *
 * Defines which routes are public, protected, or require admin access
 */

/**
 * Routes that don't require authentication
 */
export const publicRoutes = [
  '/login',
  '/signup',
  '/api/auth',
  '/api/idp', // IdP endpoints for cross-app authentication
]

/**
 * Routes that require admin role
 */
export const adminRoutes = [
  '/admin',
]

/**
 * Check if a path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (publicRoutes.includes(pathname)) {
    return true
  }

  // Prefix matches (e.g., /api/auth/*)
  return publicRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Check if a path requires admin access
 */
export function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Check if a path is a protected route (requires authentication)
 */
export function isProtectedRoute(pathname: string): boolean {
  // Next.js internal routes are not protected
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return false
  }

  // Public routes don't require authentication
  if (isPublicRoute(pathname)) {
    return false
  }

  // Everything else requires authentication
  return true
}

/**
 * Get the login URL with callback parameter
 */
export function getLoginUrl(callbackUrl?: string): string {
  const loginUrl = '/login'

  if (callbackUrl && callbackUrl !== '/login' && callbackUrl !== '/signup') {
    return `${loginUrl}?callbackURL=${encodeURIComponent(callbackUrl)}`
  }

  return loginUrl
}
