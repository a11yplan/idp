import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'

/**
 * Identity Provider Session Validation Endpoint
 *
 * Validates if the session cookie from the IdP is still valid.
 * Returns session status and basic information about the authenticated user.
 *
 * CORS headers are automatically added by corsMiddleware in src/start.ts
 */
export const Route = createFileRoute('/api/idp/validate')({
  server: {
    handlers: {
      GET: async ({ request }) => {
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

          return new Response(
            JSON.stringify(response),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        } catch (error) {
          console.error('IdP validation error:', error)

          return new Response(
            JSON.stringify({
              valid: false,
              error: 'server_error',
              error_description: 'An unexpected error occurred during session validation',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      },
    },
  },
})
