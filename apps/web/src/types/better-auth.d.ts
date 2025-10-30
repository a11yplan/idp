/**
 * Better Auth Type Extensions
 *
 * Extends Better Auth types to include admin plugin fields
 */

declare module "better-auth/client" {
  interface Session {
    /**
     * ID of the admin user who is impersonating this session.
     * Only present when an admin is actively impersonating a user.
     * Added by the admin plugin.
     */
    impersonatedBy?: string
  }
}
