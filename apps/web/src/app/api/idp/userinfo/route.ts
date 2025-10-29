import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getIdpConfig } from '@/lib/idp-config'

/**
 * Identity Provider User Info Endpoint
 *
 * Returns authenticated user's profile information including:
 * - Basic profile (id, email, name, emailVerified, createdAt, updatedAt)
 * - Extended profile (avatar, bio, phone) - if IDP_INCLUDE_PROFILE=true
 * - Organization memberships with roles - if IDP_INCLUDE_ORGANIZATIONS=true
 *
 * This endpoint validates the session cookie sent from the client application.
 * The cookie must be set via the /api/idp/authorize flow first.
 *
 * Usage:
 * fetch('https://auth.example.com/api/idp/userinfo', {
 *   credentials: 'include' // Important: include cookies
 * })
 */
export async function GET(request: NextRequest) {
  const config = getIdpConfig()

  try {
    // Get session from the request
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          error_description: 'No valid session found. Please authenticate first.',
        },
        { status: 401 }
      )
    }

    // Build user info response based on configuration
    const userInfo: Record<string, any> = {
      // Basic profile (always included)
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    }

    // Include extended profile if configured
    if (config.includeProfile) {
      userInfo.avatar = (session.user as any).avatar || null
      userInfo.bio = (session.user as any).bio || null
      userInfo.phone = (session.user as any).phone || null
    }

    // Include organization memberships if configured
    if (config.includeOrganizations) {
      try {
        // Note: Better Auth doesn't expose a direct server-side listOrganizations method
        // For IdP implementation, you would typically query the database directly
        // or use the organization.getFullOrganization method for each org

        // For now, we'll return an empty array
        // TODO: Implement database query for user's organization memberships
        userInfo.organizations = []
      } catch (orgError) {
        console.warn('Failed to fetch organizations:', orgError)
        // Don't fail the entire request if org fetching fails
        userInfo.organizations = []
      }
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

    return NextResponse.json(userInfo, { headers })
  } catch (error) {
    console.error('IdP userinfo error:', error)

    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'An unexpected error occurred while fetching user info',
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
