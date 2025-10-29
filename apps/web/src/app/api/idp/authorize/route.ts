import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getIdpConfig, isRedirectUrlAllowed, parseClientId, buildRedirectUrl } from '@/lib/idp-config'

/**
 * Identity Provider Authorization Endpoint
 *
 * This endpoint handles the IdP authorization flow:
 * 1. Validates redirect_url and client_id parameters
 * 2. Checks if user is authenticated
 * 3. If authenticated: redirects back to client app with session info
 * 4. If not authenticated: redirects to login with return URL
 *
 * Query Parameters:
 * - redirect_url (required): URL to redirect back to after authentication
 * - client_id (optional): Identifier for the client application
 * - state (optional): Opaque value to maintain state between request and callback
 *
 * Usage:
 * https://auth.example.com/api/idp/authorize?redirect_url=https://app.example.com/auth/callback&client_id=myapp
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectUrl = searchParams.get('redirect_url')
  const clientId = searchParams.get('client_id')
  const state = searchParams.get('state')

  // Validate redirect_url parameter
  if (!redirectUrl) {
    return NextResponse.json(
      {
        error: 'invalid_request',
        error_description: 'Missing required parameter: redirect_url',
      },
      { status: 400 }
    )
  }

  // Get IdP configuration
  const config = getIdpConfig()

  // Check if IdP is configured
  if (config.allowedDomains.length === 0) {
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Identity provider is not configured. Please set IDP_ALLOWED_DOMAINS.',
      },
      { status: 500 }
    )
  }

  // Validate redirect URL against allowed domains
  if (!isRedirectUrlAllowed(redirectUrl, config)) {
    return NextResponse.json(
      {
        error: 'invalid_request',
        error_description: 'The redirect_url is not in the list of allowed domains.',
        redirect_url: redirectUrl,
      },
      { status: 400 }
    )
  }

  // Validate client_id format if provided
  const validatedClientId = clientId ? parseClientId(clientId) : null
  if (clientId && !validatedClientId) {
    return NextResponse.json(
      {
        error: 'invalid_client',
        error_description: 'Invalid client_id format. Use alphanumeric characters, hyphens, and underscores only.',
      },
      { status: 400 }
    )
  }

  // Check authentication status
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      // User is not authenticated - redirect to login with return URL
      const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const loginUrl = new URL('/login', baseUrl)

      // Build the callback URL that will be used after login
      const callbackUrl = buildRedirectUrl(
        `${baseUrl}/api/idp/authorize`,
        {
          redirect_url: redirectUrl,
          client_id: validatedClientId || undefined,
          state: state || undefined,
        }
      )

      loginUrl.searchParams.set('callbackURL', callbackUrl)

      return NextResponse.redirect(loginUrl.toString())
    }

    // User is authenticated - redirect back to client app with session info
    // The session cookie is already set and will be sent with cross-domain requests

    // Build success redirect URL - only preserve state parameter if provided
    const successUrl = state
      ? buildRedirectUrl(redirectUrl, { state })
      : redirectUrl

    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error('IdP authorization error:', error)

    // Redirect to client app with error
    const errorUrl = buildRedirectUrl(redirectUrl, {
      error: 'server_error',
      error_description: 'An unexpected error occurred during authorization',
      state: state || undefined,
    })

    return NextResponse.redirect(errorUrl)
  }
}
