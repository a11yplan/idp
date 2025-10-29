import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Next.js Proxy for route protection
 * Checks authentication status and redirects unauthenticated users
 * Note: Next.js 16 renamed middleware → proxy, but exports 'middleware' function
 */

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password']

// Admin routes that require admin role
const adminRoutes = ['/admin']

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  )

  // API routes are handled by Better Auth
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Redirect to login if not authenticated
  if (!session?.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin routes
  const isAdminRoute = adminRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  )

  if (isAdminRoute) {
    const userRole = (session.user as any).role

    if (userRole !== 'admin' && userRole !== 'owner') {
      // Redirect non-admin users to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

/**
 * Configure which routes this proxy runs on
 * Exclude static files, images, and Next.js internals
 * Note: Node.js runtime is default in Next.js 16 proxy (cannot be configured)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
