"use client"

import { createAuthClient } from 'better-auth/react'
import { magicLinkClient, emailOTPClient, organizationClient, adminClient } from 'better-auth/client/plugins'

/**
 * Better Auth client instance for React
 *
 * ALWAYS use this client directly with its official API:
 * - authClient.signIn.email({ email, password })
 * - authClient.useSession()
 * - authClient.organization.create({ ... })
 * - authClient.organization.createTeam({ ... })
 * - authClient.admin.impersonateUser({ ... })
 *
 * DO NOT destructure or re-export methods as it breaks type safety
 * and creates inconsistent usage patterns across the application.
 *
 * Note: Autumn billing integration is handled through <AutumnProvider>
 * wrapper in layout.tsx, not through Better Auth client plugins
 *
 * IMPORTANT: This baseURL must match the betterAuthUrl passed to AutumnProvider
 * to ensure proper integration between Better Auth and Autumn.js.
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    organizationClient(
      {
        teams: {
          enabled: true,
        }
      }
    ),
    adminClient(),
  ],
})
