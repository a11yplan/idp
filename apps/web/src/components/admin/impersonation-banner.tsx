"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, UserX } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Extended session type that includes admin plugin fields
 */
type SessionWithImpersonation = {
  impersonatedBy?: string
  user: {
    id: string
    email: string
    name: string
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
 * The banner only renders when session.impersonatedBy field is present.
 */
export function ImpersonationBanner() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [isStoppingImpersonation, setIsStoppingImpersonation] = useState(false)

  // Don't render during loading or if not impersonating
  if (isPending || !session) {
    return null
  }

  // Check if current session is an impersonation session
  // The session.impersonatedBy field contains the admin user ID who started impersonation
  const sessionWithImpersonation = session as SessionWithImpersonation
  const isImpersonating = !!sessionWithImpersonation.impersonatedBy

  if (!isImpersonating) {
    return null
  }

  const handleStopImpersonation = async () => {
    setIsStoppingImpersonation(true)
    try {
      await authClient.admin.stopImpersonating()

      // Redirect to admin users page after stopping impersonation
      router.push("/admin/users")
      router.refresh()
    } catch (error: any) {
      console.error("[Impersonation] Failed to stop impersonating:", error)
      alert(error.message || "Failed to stop impersonation. Please try again.")
      setIsStoppingImpersonation(false)
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b-2 border-amber-600 bg-amber-100 dark:bg-amber-950 dark:border-amber-800">
      <div className="container mx-auto px-4 py-3">
        <Alert className="border-amber-600 bg-amber-50 dark:bg-amber-900 dark:border-amber-700">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Impersonation Mode Active
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You are currently viewing the application as{" "}
                <span className="font-medium">
                  {sessionWithImpersonation.user.name || sessionWithImpersonation.user.email}
                </span>
                . Actions performed will be attributed to this user.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopImpersonation}
              disabled={isStoppingImpersonation}
              className="shrink-0 border-amber-600 bg-white hover:bg-amber-50 dark:bg-amber-950 dark:hover:bg-amber-900 dark:border-amber-700"
            >
              <UserX className="h-4 w-4 mr-2" />
              {isStoppingImpersonation ? "Stopping..." : "Stop Impersonating"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
