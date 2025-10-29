"use client"


import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useParams } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BetterAuthLogger } from "@/lib/debug-logger"
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
  teams?: string[] // Team IDs this member belongs to
}

interface Team {
  id: string
  name: string
}

export default function OrganizationMembersPage() {
  const params = useParams()
  const orgId = params.id as string
  const { data: session } = authClient.useSession()

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("")
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "owner" | "admin">("member")
  const [inviteTeamId, setInviteTeamId] = useState<string>("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        BetterAuthLogger.members.response({ message: 'Fetching members for organization', orgId })

        // Use direct fetch with explicit GET method to work around Better Auth client bug
        const membersResult = await authClient.$fetch('/organization/list-members', {
          method: 'GET',
          query: { organizationId: orgId },
        })

        BetterAuthLogger.members.response(membersResult)

        // Handle response format: { data: { members: [...], total: 1 }, error: null }
        const data = membersResult.data as any
        let membersList: any[] = []

        if (data && Array.isArray(data.members)) {
          membersList = data.members
          setMembers(data.members)
          BetterAuthLogger.members.fetched(data.members.length, orgId)
        } else if (Array.isArray(membersResult)) {
          membersList = membersResult as any
          setMembers(membersResult as any)
          BetterAuthLogger.members.fetched(membersResult.length, orgId)
        } else if (membersResult && Array.isArray((membersResult as any).members)) {
          membersList = (membersResult as any).members
          setMembers((membersResult as any).members)
          BetterAuthLogger.members.fetched((membersResult as any).members.length, orgId)
        } else {
          console.warn('Unexpected members response format:', membersResult)
          BetterAuthLogger.members.error('fetch - unexpected response format', new Error('Unexpected response format'))
          setMembers([])
        }

        // Get user's role from members list (FIXED: organization.list() doesn't return role)
        if (session?.user?.id && membersList.length > 0) {
          console.log('🔍 [Members] Looking for current user in members list:', session.user.id)
          const currentUserMember = membersList.find(
            (m: any) => m.userId === session.user.id
          )

          if (currentUserMember) {
            const role = currentUserMember.role
            setUserRole(role)

            const isAdmin = role === "owner" || role === "admin"
            console.log('🎯 [Members] USER ROLE FROM MEMBERS LIST:', {
              userId: session.user.id,
              organizationId: orgId,
              userRole: role,
              isOwnerOrAdmin: isAdmin,
              canInvite: isAdmin
            })

            BetterAuthLogger.org.roleChecked(orgId, role, isAdmin)
          } else {
            console.warn('⚠️ [Members] Current user not found in members list!', {
              userId: session.user.id,
              availableMembers: membersList.map(m => ({ userId: m.userId, role: m.role }))
            })
          }
        } else {
          console.warn('⚠️ [Members] Cannot determine role:', {
            hasSession: !!session?.user?.id,
            membersCount: membersList.length
          })
        }

        // DEPRECATED: organization.list() doesn't include role property
        // Keeping this for debugging/comparison purposes only
        console.log('🔍 [Members] Checking organization.list() for comparison (not used for role)...')
        const listResult = await authClient.organization.list()
        BetterAuthLogger.org.listResponse(listResult)

        if (listResult.data) {
          const orgs = listResult.data as any[]
          console.log('🔍 [Members] organization.list() response:', orgs)
          const userOrg = orgs.find((o: any) => o.id === orgId)
          console.log('⚠️ [Members] NOTE: organization.list() does NOT include role property:', userOrg)
        }

        // Fetch teams for the organization
        const teamsResult = await authClient.organization.listTeams({
          query: {
            organizationId: orgId,
          },
        })

        if (teamsResult.data) {
          const teamsList = (teamsResult.data as any[]).map((t: any) => ({
            id: t.id,
            name: t.name,
          }))
          setTeams(teamsList)
        }

        // Fetch pending invitations for admins/owners using explicit GET
        console.log('📧 [Members] Fetching invitations...')
        const invitationsResult = await authClient.$fetch('/organization/list-invitations', {
          method: 'GET',
          query: { organizationId: orgId },
        })

        BetterAuthLogger.invitations.response(invitationsResult)

        // Handle response format: { data: [], error: null } where data is the array
        if (invitationsResult.data && Array.isArray(invitationsResult.data)) {
          const pending = invitationsResult.data.filter((inv: any) => inv.status === "pending")
          setPendingInvitations(pending)
          BetterAuthLogger.invitations.fetched(pending.length, 'pending')
        } else if (Array.isArray(invitationsResult)) {
          const pending = invitationsResult.filter((inv: any) => inv.status === "pending")
          setPendingInvitations(pending)
          BetterAuthLogger.invitations.fetched(pending.length, 'pending')
        } else if (invitationsResult && Array.isArray((invitationsResult as any).invitations)) {
          const pending = (invitationsResult as any).invitations.filter(
            (inv: any) => inv.status === "pending"
          )
          setPendingInvitations(pending)
          BetterAuthLogger.invitations.fetched(pending.length, 'pending')
        } else {
          console.warn('Unexpected invitations response format:', invitationsResult)
          BetterAuthLogger.invitations.error('fetch - unexpected response format', new Error('Unexpected response format'))
          setPendingInvitations([])
        }
      } catch (error) {
        console.error("Failed to fetch members:", error)
        BetterAuthLogger.members.error('fetch', error)
        setMembers([])
        setPendingInvitations([])
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [orgId, session?.user?.id])

  const handleInviteMember = async () => {
    setInviteLoading(true)
    setInviteError("")
    setInviteSuccess("")

    console.log('📧 [Members] Attempting to invite member:', { orgId, email: inviteEmail, role: inviteRole })

    try {
      const result = await authClient.organization.inviteMember({
        organizationId: orgId,
        email: inviteEmail,
        role: inviteRole,
        ...(inviteTeamId && { teamId: inviteTeamId }),
      })

      console.log('📧 [Members] Invite member result:', result)

      if (result.error) {
        console.error('❌ [Members] Failed to invite member:', result.error)
        BetterAuthLogger.invitations.error('send', result.error)
        setInviteError(result.error.message || "Failed to send invitation")
      } else {
        console.log('✅ [Members] Invitation sent successfully')
        BetterAuthLogger.invitations.sent(inviteEmail, inviteRole, orgId)
        setInviteSuccess("Invitation sent successfully!")
        setInviteEmail("")
        setInviteRole("member")
        setInviteTeamId("")

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

    console.log('🚫 [Members] Cancelling invitation:', invitationId)

    try {
      // Note: Method name should be organization.cancelInvitation as per docs
      await authClient.organization.cancelInvitation({
        invitationId,
      })

      console.log('✅ [Members] Invitation cancelled successfully')
      BetterAuthLogger.invitations.cancelled(invitationId)

      // Remove from local state
      setPendingInvitations(pendingInvitations.filter((inv) => inv.id !== invitationId))
    } catch (error: any) {
      console.error("Cancel invitation error:", error)
      BetterAuthLogger.invitations.error('cancel', error)
      alert(error.message || "Failed to cancel invitation")
    }
  }

  const handleResendInvitation = async (invitationId: string, email: string, role: "member" | "owner" | "admin") => {
    console.log('🔄 [Members] Resending invitation:', { invitationId, email, role })

    try {
      const result = await authClient.organization.inviteMember({
        organizationId: orgId, // Explicitly pass organizationId
        email,
        role,
        resend: true,
      })

      if (result.error) {
        console.error('❌ [Members] Failed to resend invitation:', result.error)
        BetterAuthLogger.invitations.error('resend', result.error)
        alert(result.error.message || "Failed to resend invitation")
      } else {
        console.log('✅ [Members] Invitation resent successfully')
        BetterAuthLogger.invitations.resent(invitationId, email)
        alert("Invitation resent successfully!")
      }
    } catch (error: any) {
      console.error("Resend invitation error:", error)
      BetterAuthLogger.invitations.error('resend', error)
      alert(error.message || "Failed to resend invitation")
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return
    }

    console.log('🗑️ [Members] Removing member:', userId)

    try {
      await authClient.organization.removeMember({
        organizationId: orgId,
        memberIdOrEmail: userId,
      })

      console.log('✅ [Members] Member removed successfully')
      BetterAuthLogger.members.removed(userId)

      // Refresh members list
      setMembers(members.filter((m) => m.userId !== userId))
    } catch (error: any) {
      console.error('❌ [Members] Failed to remove member:', error)
      BetterAuthLogger.members.error('remove', error)
      alert(error.message || "Failed to remove member")
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    console.log('🔄 [Members] Updating member role:', { userId, newRole })

    try {
      await authClient.organization.updateMemberRole({
        organizationId: orgId,
        memberId: userId,
        role: newRole,
      })

      console.log('✅ [Members] Member role updated successfully')
      BetterAuthLogger.members.roleUpdated(userId, newRole)

      // Update local state
      setMembers(
        members.map((m) =>
          m.userId === userId ? { ...m, role: newRole } : m
        )
      )
    } catch (error: any) {
      console.error('❌ [Members] Failed to update role:', error)
      BetterAuthLogger.members.error('update role', error)
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

        {/* Debug Panel - Only in Development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                🔍 Debug Panel (Development Only)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Organization ID:</strong> {orgId}
                </div>
                <div>
                  <strong>User Role:</strong>{' '}
                  <Badge variant={userRole ? 'default' : 'secondary'}>
                    {userRole || 'Not Set'}
                  </Badge>
                </div>
                <div>
                  <strong>Is Owner/Admin:</strong>{' '}
                  <Badge variant={isOwnerOrAdmin ? 'default' : 'destructive'}>
                    {isOwnerOrAdmin ? 'Yes ✅' : 'No ❌'}
                  </Badge>
                </div>
                <div>
                  <strong>Can Invite:</strong>{' '}
                  <Badge variant={isOwnerOrAdmin ? 'default' : 'destructive'}>
                    {isOwnerOrAdmin ? 'Yes ✅' : 'No ❌'}
                  </Badge>
                </div>
                <div>
                  <strong>Members Count:</strong> {members.length}
                </div>
                <div>
                  <strong>Pending Invites:</strong> {pendingInvitations.length}
                </div>
              </div>
              <Alert className="mt-4">
                <AlertDescription>
                  <strong>💡 Troubleshooting:</strong>
                  <br />
                  If you can't see the invite button, check the console logs for:
                  <br />
                  • "🎯 [Members] USER ROLE DETECTED" - shows your actual role
                  <br />
                  • Look for warnings about missing organization or role data
                  <br />
                  • Check if userRole is "owner" or "admin" (case-sensitive)
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

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

                  {teams.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="team">Team (Optional)</Label>
                      <Select value={inviteTeamId} onValueChange={setInviteTeamId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Team</SelectItem>
                          {teams.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
