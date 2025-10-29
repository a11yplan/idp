"use client"

import { authClient } from '../../lib/auth-client'
import { Button } from '../ui/button'
import type { ButtonProps } from '../ui/button'

interface SignOutButtonProps extends ButtonProps {
  children: React.ReactNode
}

/**
 * Client component for sign out functionality
 * Used in server components that need sign out capability
 */
export function SignOutButton({ children, ...props }: SignOutButtonProps) {
  return (
    <Button onClick={() => authClient.signOut()} {...props}>
      {children}
    </Button>
  )
}
