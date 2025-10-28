import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { isPublicRoute, isAdminRoute, getLoginUrl } from '@/lib/routes'

/**
 * Middleware for route protection and authentication
 *
 * This middleware:
 * 1. Checks authentication status for protected routes
 * 2. Redirects unauthenticated users to login
 * 3. Protects admin routes from non-admin users
 * 4. Preserves intended destination for post-login redirect
 * 5. Allows IdP authorization flows to work correctly
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

  // Allow public routes without authentication check
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check authentication status
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // Protected route but user is not authenticated
    if (!session) {
      const loginUrl = getLoginUrl(pathname)
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }

    // Check admin routes
    if (isAdminRoute(pathname)) {
      const userRole = (session.user as any).role

      if (userRole !== 'admin' && userRole !== 'owner') {
        // User is not an admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // User is authenticated and authorized
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware auth check error:', error)

    // On error, redirect to login for safety
    const loginUrl = getLoginUrl(pathname)
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }
}

/**
 * Configure which routes should run the middleware
 *
 * We match all routes except:
 * - API routes (handled by Better Auth)
 * - Static files
 * - Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - Better Auth handles these)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
