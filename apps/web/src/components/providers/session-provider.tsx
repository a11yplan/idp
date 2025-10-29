"use client"

import { ReactNode } from 'react'

/**
 * Session Provider
 *
 * Better Auth React client handles session management automatically.
 * This is a minimal provider wrapper for future extensions.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
