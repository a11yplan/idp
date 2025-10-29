import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getIdpConfig } from '@/lib/idp-config'

/**
 * Identity Provider Session Validation Endpoint
 *
 * Validates if the session cookie from the IdP is still valid.
 * Returns session status and basic information about the authenticated user.
 *
 * This is useful for client applications to check authentication status
 * without fetching full user profile data.
 *
 * Response:
 * - valid: true/false - Whether the session is valid
 * - userId: string - User ID (only if valid)
 * - expiresAt: string - Session expiry time (only if valid)
 *
 * Usage:
 * fetch('https://auth.example.com/api/idp/validate', {
 *   credentials: 'include'
 * })
 */
export async function GET(request: NextRequest) {
  const config = getIdpConfig()

  try {
    // Get session from the request
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // Build response based on session validity
    const response: Record<string, any> = {
      valid: !!session,
    }

    if (session) {
      response.userId = session.user.id
      response.email = session.user.email
      response.expiresAt = session.session.expiresAt
    }

    // Add CORS headers for allowed domains
    const origin = request.headers.get('origin')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (origin) {
      // Check if origin is allowed
      const allowedOrigins = config.allowedDomains.map((domain) => {
        if (domain.includes('localhost')) {
          return `http://${domain}`
        }
        return `https://${domain}`
      })

      if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin
        headers['Access-Control-Allow-Credentials'] = 'true'
        headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        headers['Access-Control-Allow-Headers'] = 'Content-Type'
      }
    }

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('IdP validation error:', error)

    return NextResponse.json(
      {
        valid: false,
        error: 'server_error',
        error_description: 'An unexpected error occurred during session validation',
      },
      { status: 500 }
    )
  }
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const config = getIdpConfig()
  const origin = request.headers.get('origin')

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  if (origin) {
    // Check if origin is allowed
    const allowedOrigins = config.allowedDomains.map((domain) => {
      if (domain.includes('localhost')) {
        return `http://${domain}`
      }
      return `https://${domain}`
    })

    if (allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin
      headers['Access-Control-Allow-Credentials'] = 'true'
    }
  }

  return new NextResponse(null, { status: 204, headers })
}
