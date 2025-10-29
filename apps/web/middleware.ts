import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { isPublicRoute, isAdminRoute, getLoginUrl } from '@/lib/routes'
import { config as appConfig } from '@/lib/config'

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales: appConfig.availableLocales,
  defaultLocale: appConfig.defaultLocale,
  localePrefix: 'as-needed', // Default locale (en) has no prefix, only /de for German
})

/**
 * Combined Middleware for i18n and authentication
 *
 * This middleware:
 * 1. Handles i18n routing (locale detection and prefixing)
 * 2. Performs lightweight authentication check (cookie existence)
 * 3. Redirects unauthenticated users to login for fast UX
 *
 * SECURITY NOTE: This middleware only checks for session cookie existence.
 * It does NOT validate the session. Protected pages MUST perform server-side
 * session validation using auth.api.getSession() for security.
 *
 * This approach follows Better Auth best practices:
 * - Middleware: Fast optimistic redirects (no DB calls)
 * - Server Components: Secure session validation (with DB)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow Next.js internals, static files, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next()
  }

  // Allow API routes (no i18n, no auth check here)
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Step 1: Handle i18n routing
  const intlResponse = intlMiddleware(request)

  // Extract locale from pathname (e.g., /en/profile -> en)
  const pathnameLocale = pathname.split('/')[1]
  const isValidLocale = appConfig.availableLocales.includes(pathnameLocale as any)

  // Get the pathname without locale (e.g., /en/profile -> /profile)
  const pathnameWithoutLocale = isValidLocale
    ? pathname.slice(pathnameLocale.length + 1) || '/'
    : pathname

  // Step 2: Check if route requires authentication
  if (isPublicRoute(pathnameWithoutLocale)) {
    return intlResponse
  }

  // Step 3: Check for session cookie (lightweight, fast check)
  // NOTE: This only checks cookie existence, not validity
  const sessionCookie = getSessionCookie(request)

  // Protected route but user has no session cookie
  if (!sessionCookie) {
    const locale = isValidLocale ? pathnameLocale : appConfig.defaultLocale
    const loginUrl = `/${locale}${getLoginUrl(pathnameWithoutLocale)}`
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }

  // Session cookie exists - allow request to proceed
  // The page itself will validate the session server-side
  return intlResponse
}

/**
 * Configure which routes should run the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.svg (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
