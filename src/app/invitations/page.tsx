"use client"

import { useEffect, useState } from "react"
import { organization, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export const dynamic = 'force-dynamic'

interface Invitation {
  id: string
  organizationId: string
  role: string
  status: string
  expiresAt: Date
  createdAt: Date
  organization: {
    id: string
    name: string
    slug: string
  }
  inviter: {
    id: string
    user: {
      name: string
      email: string
    }
  }
}

export default function InvitationsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchInvitations()
    }
  }, [session])

  const fetchInvitations = async () => {
    try {
      const result = await organization.listUserInvitations()
      if (result.data) {
        // Filter for pending invitations only
        const pending = (result.data as any[]).filter(
          (inv: any) => inv.status === "pending"
        )
        setInvitations(pending)
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error)
      toast.error("Failed to load invitations")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (invitationId: string) => {
    setActionLoading(invitationId)
    try {
      const result = await organization.acceptInvitation({
        invitationId,
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to accept invitation")
      } else {
        toast.success("Invitation accepted! Welcome to the organization.")
        // Remove from list
        setInvitations(invitations.filter((inv) => inv.id !== invitationId))
        // Refresh organizations list
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (invitationId: string) => {
    setActionLoading(invitationId)
    try {
      const result = await organization.rejectInvitation({
        invitationId,
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to reject invitation")
      } else {
        toast.success("Invitation rejected")
        // Remove from list
        setInvitations(invitations.filter((inv) => inv.id !== invitationId))
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setActionLoading(null)
    }
  }

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date()
  }

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff < 0) return "Expired"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`
    return "Expires soon"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground">
            Review and respond to organization invitations
          </p>
        </div>

        {invitations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold">No pending invitations</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  You don't have any pending organization invitations at the moment.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const expired = isExpired(invitation.expiresAt)
              const isProcessing = actionLoading === invitation.id

              return (
                <Card key={invitation.id} className={expired ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{invitation.organization.name}</CardTitle>
                        <CardDescription>@{invitation.organization.slug}</CardDescription>
                      </div>
                      <Badge variant={expired ? "secondary" : "default"}>
                        {invitation.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm space-y-2">
                        <p className="text-muted-foreground">
                          Invited by{" "}
                          <span className="font-medium text-foreground">
                            {invitation.inviter.user.name || invitation.inviter.user.email}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Sent on{" "}
                          <span className="font-medium text-foreground">
                            {new Date(invitation.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                        {invitation.expiresAt && (
                          <p
                            className={`text-sm ${
                              expired ? "text-destructive" : "text-muted-foreground"
                            }`}
                          >
                            {getTimeRemaining(invitation.expiresAt)}
                          </p>
                        )}
                      </div>

                      {expired ? (
                        <Alert variant="destructive">
                          <AlertDescription>
                            This invitation has expired. Please contact the organization
                            administrator for a new invitation.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAccept(invitation.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Processing..." : "Accept"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleReject(invitation.id)}
                            disabled={isProcessing}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
