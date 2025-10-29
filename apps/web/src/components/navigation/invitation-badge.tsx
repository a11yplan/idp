"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Bell } from "lucide-react"
import { useOrganization } from "@/contexts/organization-context"

export function InvitationBadge() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { organizations, isLoading: orgsLoading } = useOrganization()

  useEffect(() => {
    // Only fetch invitations if user has access to organizations
    // (either member of existing orgs or can receive invitations)
    fetchInvitationCount()

    // Poll for new invitations every 60 seconds
    const interval = setInterval(fetchInvitationCount, 60000)

    return () => clearInterval(interval)
  }, [])

  const fetchInvitationCount = async () => {
    try {
      const result = await authClient.organization.listUserInvitations()
      if (result.data) {
        // Count only pending invitations
        const pending = (result.data as any[]).filter(
          (inv: any) => inv.status === "pending"
        )
        setCount(pending.length)
      }
    } catch (error) {
      console.error("Failed to fetch invitation count:", error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show while loading or if no invitations
  if (orgsLoading || loading || count === 0) {
    return null
  }

  return (
    <Link
      href="/invitations"
      className="relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Bell className="h-4 w-4" />
      <span className="hidden sm:inline">Invitations</span>
      <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
        {count}
      </Badge>
    </Link>
  )
}
