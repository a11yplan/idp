"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"

interface SignOutButtonProps extends ButtonProps {
  children: React.ReactNode
  redirectUrl?: string
}

/**
 * Client component for sign out functionality
 * Used in server components that need sign out capability
 * Redirects to /login by default after successful sign out
 */
export function SignOutButton({ children, redirectUrl = '/login', ...props }: SignOutButtonProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push(redirectUrl)
    router.refresh()
  }

  return (
    <Button onClick={handleSignOut} {...props}>
      {children}
    </Button>
  )
}
