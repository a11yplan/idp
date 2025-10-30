"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { AlertTriangle, UserX, User } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

/**
 * Extended session type that includes admin plugin fields
 */
type SessionWithImpersonation = {
  user: {
    id: string
    email: string
    name: string
    [key: string]: any
  }
  session: {
    impersonatedBy?: string
    [key: string]: any
  }
  [key: string]: any
}

/**
 * Impersonation Banner Component
 *
 * Displays a prominent warning banner when an admin is impersonating a user.
 * Provides a one-click button to stop impersonation and return to admin account.
 *
 * Features:
 * - App-wide visibility with sticky positioning
 * - Smooth fade-in animation
 * - Responsive design for all screen sizes
 * - Accessible keyboard navigation
 * - Clear visual hierarchy with warning colors
 */
export function ImpersonationBanner() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [isStoppingImpersonation, setIsStoppingImpersonation] = useState(false)

  // Don't render while loading
  if (isPending || !session) {
    return null
  }

  // Check if current session is an impersonation session
  // The impersonatedBy field is nested at session.session.impersonatedBy
  const sessionWithImpersonation = session as SessionWithImpersonation
  const isImpersonating = !!sessionWithImpersonation.session?.impersonatedBy

  // Only show banner during active impersonation
  if (!isImpersonating) {
    return null
  }

  const handleStopImpersonation = async () => {
    setIsStoppingImpersonation(true)
    try {
      await authClient.admin.stopImpersonating()

      // Show success feedback
      toast.success("Impersonation stopped", {
        description: "You have returned to your admin account"
      })

      // Redirect to admin users page
      router.push("/admin/users")
      router.refresh()
    } catch (error: any) {
      console.error("[Impersonation] Failed to stop impersonating:", error)
      toast.error("Failed to stop impersonation", {
        description: error.message || "Please try again"
      })
      setIsStoppingImpersonation(false)
    }
  }

  const impersonatedUser = sessionWithImpersonation.user

  return (
    <div
      className="sticky top-0 z-[100] w-full border-b border-blue-200/50 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-800/30 backdrop-blur-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/50">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Viewing as
              </span>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 truncate">
                {impersonatedUser.name || impersonatedUser.email}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleStopImpersonation}
              disabled={isStoppingImpersonation}
              size="sm"
              variant="ghost"
              className="h-8 text-xs font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-blue-900/50"
            >
              <UserX className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              {isStoppingImpersonation ? "Stopping..." : "Exit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
