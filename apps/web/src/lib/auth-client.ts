"use client"

import { createAuthClient } from 'better-auth/react'
import { magicLinkClient, organizationClient, adminClient } from 'better-auth/client/plugins'

/**
 * Better Auth client instance for React
 * Use this in your client components to interact with authentication
 *
 * Note: Autumn billing integration is handled through <AutumnProvider>
 * wrapper in layout.tsx, not through Better Auth client plugins
 *
 * IMPORTANT: This baseURL must match the betterAuthUrl passed to AutumnProvider
 * to ensure proper integration between Better Auth and Autumn.js
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  plugins: [
    magicLinkClient(),
    organizationClient(),
    adminClient(),
  ],
})

/**
 * Export all auth methods for convenience
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  updateUser,
  changePassword,
  sendVerificationEmail,
  changeEmail,
  deleteUser,
} = authClient

/**
 * Export organization methods
 */
export const organization = authClient.organization

/**
 * Export admin methods
 */
export const admin = authClient.admin
