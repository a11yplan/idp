import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { NextRequest, NextResponse } from "next/server"

// Use Node.js runtime for Better Auth (PostgreSQL Pool requires Node.js APIs)
export const runtime = 'nodejs'

/**
 * Better Auth API Route Handler for Next.js App Router
 * Handles all authentication routes: /api/auth/*
 *
 * This single handler manages:
 * - Sign in/up (email/password and magic link)
 * - Email verification
 * - Password reset
 * - Session management
 * - Organization management
 * - Admin operations
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
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With')
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  return response
}

// Get Better Auth handlers
const { GET: betterAuthGET, POST: betterAuthPOST } = toNextJsHandler(auth)

/**
 * Handle OPTIONS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const response = new NextResponse(null, { status: 204 })
  return addCorsHeaders(response, origin)
}

/**
 * Handle GET requests with CORS
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const response = await betterAuthGET(request)
  return addCorsHeaders(response, origin)
}

/**
 * Handle POST requests with CORS
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const response = await betterAuthPOST(request)
  return addCorsHeaders(response, origin)
}
