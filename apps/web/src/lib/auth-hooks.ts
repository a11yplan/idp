/**
 * Auth Utility Hooks
 *
 * Convenience hooks built on top of Better Auth's useSession hook
 * Use these for common auth-related checks in your components
 */

import { useSession } from './auth-client'

/**
 * Hook to check if user is authenticated
 *
 * @returns true if user is logged in, false otherwise
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isAuthenticated = useIsAuthenticated()
 *
 *   if (!isAuthenticated) {
 *     return <div>Please log in</div>
 *   }
 *
 *   return <div>Welcome!</div>
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
  const { data: session, isPending } = useSession()
  return !isPending && !!session?.user
}

/**
 * Hook to check if user is admin
 *
 * @returns true if user has admin or owner role, false otherwise
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const isAdmin = useIsAdmin()
 *
 *   if (!isAdmin) {
 *     return <div>Access denied</div>
 *   }
 *
 *   return <div>Admin controls</div>
 * }
 * ```
 */
export function useIsAdmin(): boolean {
  const { data: session, isPending } = useSession()

  if (isPending || !session?.user) return false

  const role = (session.user as any).role
  return role === 'admin' || role === 'owner'
}
