"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useSession as useBetterAuthSession } from '@/lib/auth-client'

/**
 * Auth Context Type
 * Wraps Better Auth's session hook with additional error handling
 */
interface AuthContextType {
  session: ReturnType<typeof useBetterAuthSession>['data']
  isLoading: boolean
  error: ReturnType<typeof useBetterAuthSession>['error']
  isPending: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Auth Provider Component
 *
 * Wraps Better Auth's session management in a React context to:
 * - Provide centralized session state
 * - Handle loading and error states
 * - Prevent hydration mismatches
 * - Enable graceful error recovery
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Use Better Auth's session hook
  const { data: session, isPending, error } = useBetterAuthSession()

  const value: AuthContextType = {
    session,
    isLoading: isPending,
    error,
    isPending,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access auth context
 *
 * Usage:
 * ```tsx
 * const { session, isLoading } = useAuth()
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { session, isLoading } = useAuth()
  return !isLoading && !!session?.user
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { session, isLoading } = useAuth()
  if (isLoading || !session?.user) return false

  const role = (session.user as any).role
  return role === 'admin' || role === 'owner'
}
