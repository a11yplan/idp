/**
 * Role-Based Access Control (RBAC) Utilities
 *
 * Helper functions for checking user permissions and roles
 */

export type UserRole = 'owner' | 'admin' | 'member' | 'user'

export interface User {
  id: string
  email: string
  role?: string | null
  [key: string]: any
}

/**
 * Get admin user IDs from environment variable
 */
function getAdminUserIds(): string[] {
  const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS || ''
  return adminIds.split(',').map(id => id.trim()).filter(Boolean)
}

/**
 * Check if user is a Better Auth admin
 * Better Auth admin = user with 'admin' role OR user ID in adminUserIds
 */
export function isBetterAuthAdmin(user?: User | null): boolean {
  if (!user) return false

  // Check if user has admin role
  if (user.role === 'admin') return true

  // Check if user ID is in adminUserIds
  const adminUserIds = getAdminUserIds()
  return adminUserIds.includes(user.id)
}

/**
 * Check if user has admin access (owner or admin role)
 */
export function canAccessAdmin(user?: User | null): boolean {
  if (!user) return false
  return user.role === 'admin' || user.role === 'owner'
}

/**
 * Check if user has owner role
 */
export function isOwner(user?: User | null): boolean {
  if (!user) return false
  return user.role === 'owner'
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null | undefined, roles: UserRole | UserRole[]): boolean {
  if (!user || !user.role) return false

  if (Array.isArray(roles)) {
    return roles.includes(user.role as UserRole)
  }

  return user.role === roles
}

/**
 * Check if user can manage an organization
 * (owner of the org or admin/owner user role)
 */
export function canManageOrganization(
  user?: User | null,
  organizationOwnerId?: string
): boolean {
  if (!user) return false

  // System admin/owner can manage all organizations
  if (canAccessAdmin(user)) return true

  // Organization owner can manage their organization
  if (organizationOwnerId && user.id === organizationOwnerId) return true

  return false
}

/**
 * Check if user can view admin panel
 */
export function canViewAdminPanel(user?: User | null): boolean {
  return canAccessAdmin(user)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user?: User | null): boolean {
  return !!user && !!user.id
}

/**
 * Get user display name (fallback to email if no name)
 */
export function getUserDisplayName(user?: User | null): string {
  if (!user) return 'Guest'
  return user.name || user.email || 'User'
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user?: User | null): string {
  if (!user) return '?'

  if (user.name) {
    return user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return user.email?.[0]?.toUpperCase() || '?'
}
