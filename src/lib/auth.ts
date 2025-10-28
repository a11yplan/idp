import { betterAuth } from 'better-auth'
import { magicLink, organization, admin, jwt, customSession } from 'better-auth/plugins'
import { autumn } from 'autumn-js/better-auth'

import { Pool } from 'pg'
import {
  sendVerificationEmail,
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendOrganizationInvitationEmail,
} from './email'

/**
 * Better Auth configuration with PostgreSQL (Node.js runtime)
 *
 * Uses standard PostgreSQL Pool:
 * - Compatible with Node.js runtime on Vercel
 * - Connection pooling provided by pg Pool
 * - Works with Neon PostgreSQL database
 * - Standard approach recommended by Better Auth
 */

const databaseUrl = process.env.DATABASE_URL || ''

if (!databaseUrl) {
  console.warn('DATABASE_URL not configured. Database connection will fail.')
}

/**
 * Create PostgreSQL connection pool
 * Standard approach that works in Node.js runtime
 */
const pool = new Pool({
  connectionString: databaseUrl,
})

const allowedDomains = process.env.IDP_ALLOWED_DOMAINS ? process.env.IDP_ALLOWED_DOMAINS.split(',').map((domain) => {
  const trimmed = domain.trim()
  // Add protocol if not present
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    // Default to https for production, http for localhost
    const protocol = trimmed.includes('localhost') ? 'http://' : 'https://'
    return protocol + trimmed
  }
  return trimmed
}) : []
/**
 * Better Auth instance
 */
export const auth = betterAuth({
  database: pool,

  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',

  // Email and Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true, // Require email verification before sign in
    disableSignUp: false, // Disable public registration by default
    sendResetPassword: async ({ user, url, token }) => {
      await sendPasswordResetEmail({
        email: user.email,
        url,
        token,
      })
    },
  },

  // Email verification configuration
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendVerificationEmail({
        email: user.email,
        url,
        token,
      })
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // User schema (extendable)
  user: {
    additionalFields: {
      avatar: {
        type: 'string',
        required: false,
      },
      bio: {
        type: 'string',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },

  // Plugins
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user: user,
        session: session
      }
    }),
    // convex(),
    jwt({
      jwks: {
        // remoteUrl: "api/auth/jwks",
        keyPairConfig: {
          alg: "ES256"
        },
      },
      jwt: {
        // JWT configuration for Convex integration
        issuer: process.env.CONVEX_SITE_URL,
        audience: "convex",
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        await sendMagicLinkEmail({
          email,
          url,
          token,
        })
      },
      expiresIn: 60 * 10, // 10 minutes
    }),
    organization({
      // Organization configuration
      allowUserToCreateOrganization: true,
      organizationLimit: 10, // Max organizations per user

      // No teams - simplified organization structure
      teamConfiguration: {
        enabled: false,
      },

      // Default roles: owner, admin, member
      defaultRole: 'member',

      // Send invitation email when user is invited to organization
      async sendInvitationEmail(data) {
        const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const inviteLink = `${baseUrl}/accept-invitation/${data.id}`

        await sendOrganizationInvitationEmail({
          email: data.email,
          inviterName: data.inviter.user.name || data.inviter.user.email,
          organizationName: data.organization.name,
          inviteLink,
          role: Array.isArray(data.role) ? data.role[0] : data.role,
        })
      },
    }),
    admin({
      // Admin configuration
      // Admins can manage users, roles, and impersonate
      defaultRole: 'user', // Default role for new users

      adminUserIds: ["bdb9cd34-3e07-4a15-808b-0bf9cdaa3670"],
      // Admin permissions
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),
    autumn({
      // Autumn billing configuration
      // Billing is scoped to organizations (not individual users)
      customerScope: 'organization',
    }),
  ],

  // Advanced options
  advanced: {
    generateId: () => crypto.randomUUID(),
    // Use secure cookies in production or when HTTPS is detected
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.IDP_BASE_DOMAIN,
    },
    trustedOrigins: allowedDomains,
  },

  // Trusted origins for IdP flow (allows CORS from client apps)
  trustedOrigins: allowedDomains,

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
  },
})

/**
 * Export type helper for TypeScript
 */
export type Auth = typeof auth
