import { createMiddleware } from '@tanstack/react-start'
import { getSessionCookie } from 'better-auth/cookies'
import { isPublicRoute, getLoginUrl } from '../lib/routes'

/**
 * Authentication Middleware for TanStack Start
 *
 * Replaces Next.js middleware auth logic:
 * - Checks for session cookie existence (lightweight, fast check)
 * - Redirects unauthenticated users to login page
 * - Preserves the callback URL for post-login redirect
 *
 * SECURITY NOTE: This middleware only checks for session cookie existence.
 * It does NOT validate the session. Protected routes MUST perform server-side
 * session validation using auth.api.getSession() for security.
 */
export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    return next()
  }

  // Check for session cookie (lightweight, fast check)
  const sessionCookie = getSessionCookie(request)

  // Protected route but user has no session cookie
  if (!sessionCookie) {
    // Build login URL with callback
    const callbackUrl = pathname !== '/' ? pathname : undefined
    const loginUrl = getLoginUrl(callbackUrl)

    // Redirect to login page
    return new Response(null, {
      status: 302,
      headers: {
        Location: loginUrl,
      },
    })
  }

  // Session cookie exists - allow request to proceed
  // The route itself will validate the session server-side
  return next()
})
