import { createMiddleware } from '@tanstack/react-start'

/**
 * CORS Middleware for TanStack Start
 *
 * Handles cross-origin requests for IdP endpoints.
 * Replaces the CORS logic from Next.js API routes.
 */

/**
 * Get allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  const domains = process.env.IDP_ALLOWED_DOMAINS
  if (!domains) return []

  return domains.split(',').map((domain) => {
    const trimmed = domain.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      const protocol = trimmed.includes('localhost') ? 'http://' : 'https://'
      return protocol + trimmed
    }
    return trimmed
  })
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: Response, origin: string | null): Response {
  const allowedOrigins = getAllowedOrigins()

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With')
    headers.set('Access-Control-Max-Age', '86400')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  return response
}

/**
 * CORS middleware for IdP endpoints
 */
export const corsMiddleware = createMiddleware().server(async ({ next, request }) => {
  const origin = request.headers.get('origin')
  const url = new URL(request.url)

  // Only apply CORS to /api/auth and /api/idp routes
  if (!url.pathname.startsWith('/api/auth') && !url.pathname.startsWith('/api/idp')) {
    return next()
  }

  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new Response(null, { status: 204 })
    return addCorsHeaders(response, origin)
  }

  // Process the request and add CORS headers to response
  const response = await next()
  return addCorsHeaders(response, origin)
})
