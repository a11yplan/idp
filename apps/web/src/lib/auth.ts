import { betterAuth } from 'better-auth'
import { magicLink, emailOTP, organization, admin, jwt, customSession, username } from 'better-auth/plugins'
import { autumn } from 'autumn-js/better-auth'

import { Pool } from 'pg'
import {
  sendVerificationEmail,
  sendMagicLinkEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendOrganizationInvitationEmail,
} from './email'
import { populateCustomSession } from './auth-session'

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
 * Enable username/password authentication
 * Disabled by default, can be enabled via ENABLE_USERNAME_AUTH=true
 */
const enableUsernameAuth = process.env.ENABLE_USERNAME_AUTH === 'true'
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
  },

  // Plugins
  plugins: [
    // Conditionally enable username authentication
    ...(enableUsernameAuth ? [username()] : []),
    customSession(async ({ user, session }) => {
      return await populateCustomSession(user, session, pool)
    }),
    // convex(),
    jwt({
      jwks: {
        disablePrivateKeyEncryption: true,
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
      expiresIn: 60 * 60, // 1 hour
    }),
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOTPEmail({
          email,
          otp,
          type,
        })
      },
      expiresIn: 60 * 10, // 10 minutes
      otpLength: 6, // 6-digit OTP code
    }),
    organization({
      // Organization configuration
      allowUserToCreateOrganization: true,
      organizationLimit: 10, // Max organizations per user

      // Teams enabled for advanced organization management
      teams: {
        enabled: true,
        maximumTeams: 20, // Max teams per organization
        maximumMembersPerTeam: 50, // Max members per team
        allowRemovingAllTeams: false, // Prevent removing the last team
      },

      // Default roles: owner, admin, member
      defaultRole: 'member',

      // Explicitly set creator role to 'owner'
      creatorRole: 'owner',

      // Organization hooks for logging and debugging
      organizationHooks: {
        // After creating an organization
        afterCreateOrganization: async ({ organization, user, member }) => {
          console.log('🎉 [Better Auth] Organization created', {
            organizationId: organization.id,
            organizationName: organization.name,
            organizationSlug: organization.slug,
            userId: user?.id || 'Unknown',
            userEmail: user?.email || 'Unknown',
            memberRole: member?.role || 'Unknown',
            createdAt: organization.createdAt,
          })
        },

        // After creating an invitation
        afterCreateInvitation: async ({ invitation, inviter, organization }) => {
          console.log('📧 [Better Auth] Invitation created', {
            invitationId: invitation.id,
            invitedEmail: invitation.email,
            role: invitation.role,
            organizationId: organization.id,
            organizationName: organization.name,
            inviterId: inviter.userId,
            // Use optional chaining - inviter structure varies
            inviterEmail: inviter.user?.email || inviter.email || 'Unknown',
            expiresAt: invitation.expiresAt,
          })
        },

        // After accepting an invitation
        afterAcceptInvitation: async ({ invitation, member, user, organization }) => {
          console.log('✅ [Better Auth] Invitation accepted', {
            invitationId: invitation.id,
            userId: user?.id || 'Unknown',
            userEmail: user?.email || 'Unknown',
            memberRole: member?.role || 'Unknown',
            organizationId: organization.id,
            organizationName: organization.name,
          })
        },

        // After cancelling an invitation
        afterCancelInvitation: async ({ invitation, cancelledBy, organization }) => {
          console.log('🚫 [Better Auth] Invitation cancelled', {
            invitationId: invitation.id,
            invitedEmail: invitation.email,
            cancelledByUserId: cancelledBy?.userId || 'Unknown',
            organizationId: organization.id,
            organizationName: organization.name,
          })
        },

        // After rejecting an invitation
        afterRejectInvitation: async ({ invitation, user, organization }) => {
          console.log('❌ [Better Auth] Invitation rejected', {
            invitationId: invitation.id,
            userId: user?.id || 'Unknown',
            userEmail: user?.email || 'Unknown',
            organizationId: organization.id,
            organizationName: organization.name,
          })
        },
      },

      // Send invitation email when user is invited to organization
      async sendInvitationEmail(data) {
        const baseUrl = (process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').trim()
        const inviteLink = `${baseUrl}/accept-invitation/${data.id}`

        console.log('📤 [Better Auth] Sending invitation email', {
          invitationId: data.id,
          email: data.email,
          role: Array.isArray(data.role) ? data.role[0] : data.role,
          organizationId: data.organization.id,
          organizationName: data.organization.name,
          inviteLink,
        })

        await sendOrganizationInvitationEmail({
          email: data.email,
          inviterName: data.inviter.user.name || data.inviter.user.email,
          organizationName: data.organization.name,
          inviteLink,
          role: Array.isArray(data.role) ? data.role[0] : data.role,
        })

        console.log('✅ [Better Auth] Invitation email sent successfully to', data.email)
      },
    }),
    admin({
      // Admin configuration
      // Admins can manage users, roles, and impersonate
      defaultRole: 'user', // Default role for new users

      adminUserIds: process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || [],
      // Admin permissions
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),
    // autumn({
    //   // Autumn billing configuration
    //   // Billing is scoped to organizations (not individual users)
    //   customerScope: 'organization',
    // }),
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
