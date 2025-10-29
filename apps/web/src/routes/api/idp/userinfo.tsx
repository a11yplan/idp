import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { getIdpConfig } from '../../../lib/idp-config'

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
 * CORS headers are automatically added by corsMiddleware in src/start.ts
 */
export const Route = createFileRoute('/api/idp/userinfo')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const config = getIdpConfig()

        try {
          // Get session from the request
          const session = await auth.api.getSession({
            headers: request.headers,
          })

          if (!session) {
            return new Response(
              JSON.stringify({
                error: 'unauthorized',
                error_description: 'No valid session found. Please authenticate first.',
              }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
              }
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

          return new Response(
            JSON.stringify(userInfo),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        } catch (error) {
          console.error('IdP userinfo error:', error)

          return new Response(
            JSON.stringify({
              error: 'server_error',
              error_description: 'An unexpected error occurred while fetching user info',
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
