"use client"


import { useEffect, useState } from "react"
import { organization, authClient } from "@/lib/auth-client"
import { useParams } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const dynamic = 'force-dynamic'

interface Member {
  id: string
  userId: string
  role: string
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

export default function OrganizationMembersPage() {
  const params = useParams()
  const orgId = params.id as string

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("")
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])

  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "owner" | "admin">("member")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Use direct fetch with explicit GET method to work around Better Auth client bug
        const membersResult = await authClient.$fetch('/organization/list-members', {
          method: 'GET',
          query: { organizationId: orgId },
        })

        // Handle response format: { data: { members: [...], total: 1 }, error: null }
        const data = membersResult.data as any
        if (data && Array.isArray(data.members)) {
          setMembers(data.members)
        } else if (Array.isArray(membersResult)) {
          setMembers(membersResult as any)
        } else if (membersResult && Array.isArray((membersResult as any).members)) {
          setMembers((membersResult as any).members)
        } else {
          console.warn('Unexpected members response format:', membersResult)
          setMembers([])
        }

        // Get user's role
        const listResult = await organization.list()
        if (listResult.data) {
          const userOrg = (listResult.data as any[]).find((o: any) => o.id === orgId)
          if (userOrg) {
            setUserRole(userOrg.role)
          }
        }

        // Fetch pending invitations for admins/owners using explicit GET
        const invitationsResult = await authClient.$fetch('/organization/list-invitations', {
          method: 'GET',
          query: { organizationId: orgId },
        })

        // Handle response format: { data: [], error: null } where data is the array
        if (invitationsResult.data && Array.isArray(invitationsResult.data)) {
          const pending = invitationsResult.data.filter((inv: any) => inv.status === "pending")
          setPendingInvitations(pending)
        } else if (Array.isArray(invitationsResult)) {
          const pending = invitationsResult.filter((inv: any) => inv.status === "pending")
          setPendingInvitations(pending)
        } else if (invitationsResult && Array.isArray((invitationsResult as any).invitations)) {
          const pending = (invitationsResult as any).invitations.filter(
            (inv: any) => inv.status === "pending"
          )
          setPendingInvitations(pending)
        } else {
          console.warn('Unexpected invitations response format:', invitationsResult)
          setPendingInvitations([])
        }
      } catch (error) {
        console.error("Failed to fetch members:", error)
        setMembers([])
        setPendingInvitations([])
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [orgId])

  const handleInviteMember = async () => {
    setInviteLoading(true)
    setInviteError("")
    setInviteSuccess("")

    try {
      const result = await organization.inviteMember({
        organizationId: orgId,
        email: inviteEmail,
        role: inviteRole,
      })

      if (result.error) {
        setInviteError(result.error.message || "Failed to send invitation")
      } else {
        setInviteSuccess("Invitation sent successfully!")
        setInviteEmail("")
        setInviteRole("member")

        // Refresh invitations list using explicit GET
        const invitationsResult = await authClient.$fetch('/organization/list-invitations', {
          method: 'GET',
          query: { organizationId: orgId },
        })

        // Handle response format: { data: [], error: null }
        if (invitationsResult.data && Array.isArray(invitationsResult.data)) {
          const pending = invitationsResult.data.filter((inv: any) => inv.status === "pending")
          setPendingInvitations(pending)
        } else if (Array.isArray(invitationsResult)) {
          const pending = invitationsResult.filter((inv: any) => inv.status === "pending")
          setPendingInvitations(pending)
        } else if (invitationsResult && Array.isArray((invitationsResult as any).invitations)) {
          const pending = (invitationsResult as any).invitations.filter(
            (inv: any) => inv.status === "pending"
          )
          setPendingInvitations(pending)
        }

        setTimeout(() => {
          setInviteDialogOpen(false)
          setInviteSuccess("")
        }, 2000)
      }
    } catch (error: any) {
      setInviteError(error.message || "An error occurred")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) {
      return
    }

    try {
      // Note: Method name should be organization.cancelInvitation as per docs
      await organization.cancelInvitation({
        invitationId,
      })

      // Remove from local state
      setPendingInvitations(pendingInvitations.filter((inv) => inv.id !== invitationId))
    } catch (error: any) {
      console.error("Cancel invitation error:", error)
      alert(error.message || "Failed to cancel invitation")
    }
  }

  const handleResendInvitation = async (invitationId: string, email: string, role: "member" | "owner" | "admin") => {
    try {
      const result = await organization.inviteMember({
        organizationId: orgId, // Explicitly pass organizationId
        email,
        role,
        resend: true,
      })

      if (result.error) {
        alert(result.error.message || "Failed to resend invitation")
      } else {
        alert("Invitation resent successfully!")
      }
    } catch (error: any) {
      console.error("Resend invitation error:", error)
      alert(error.message || "Failed to resend invitation")
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return
    }

    try {
      await organization.removeMember({
        organizationId: orgId,
        memberIdOrEmail: userId,
      })

      // Refresh members list
      setMembers(members.filter((m) => m.userId !== userId))
    } catch (error: any) {
      alert(error.message || "Failed to remove member")
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await organization.updateMemberRole({
        organizationId: orgId,
        memberId: userId,
        role: newRole,
      })

      // Update local state
      setMembers(
        members.map((m) =>
          m.userId === userId ? { ...m, role: newRole } : m
        )
      )
    } catch (error: any) {
      alert(error.message || "Failed to update role")
    }
  }

  const isOwnerOrAdmin = userRole === "owner" || userRole === "admin"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <BackButton href={`/organizations/${orgId}`} />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-muted-foreground">Manage team members and permissions</p>
          </div>
          {isOwnerOrAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>Invite Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to add a new member to your organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="member@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as "member" | "owner" | "admin")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {inviteError && (
                    <Alert variant="destructive">
                      <AlertDescription>{inviteError}</AlertDescription>
                    </Alert>
                  )}

                  {inviteSuccess && (
                    <Alert>
                      <AlertDescription>{inviteSuccess}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleInviteMember}
                    disabled={inviteLoading || !inviteEmail}
                  >
                    {inviteLoading ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

{isOwnerOrAdmin && pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations ({pendingInvitations.length})</CardTitle>
              <CardDescription>
                Invitations that have been sent but not yet accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {new Date(invitation.createdAt).toLocaleDateString()}
                        {invitation.expiresAt && (
                          <> · Expires {new Date(invitation.expiresAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{invitation.role}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResendInvitation(invitation.id, invitation.email, invitation.role)}
                      >
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Team Members ({members.length})</CardTitle>
            <CardDescription>
              People who have access to this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{member.user.name || member.user.email}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {isOwnerOrAdmin && member.role !== "owner" ? (
                      <Select
                        value={member.role}
                        onValueChange={(role) => handleUpdateRole(member.userId, role)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge>{member.role}</Badge>
                    )}
                    {isOwnerOrAdmin && member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
