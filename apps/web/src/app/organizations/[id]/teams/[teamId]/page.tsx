"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useParams, useRouter } from "next/navigation"
import { useOrganization } from "@/contexts/organization-context"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Users, Settings } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

interface TeamMember {
  id: string
  userId: string
  teamId: string
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface TeamDetail {
  id: string
  name: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { activeOrganization, setActiveOrganization } = useOrganization()
  const orgId = params.id as string
  const teamId = params.teamId as string

  const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [organizationMembers, setOrganizationMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Add member dialog
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [addMemberLoading, setAddMemberLoading] = useState(false)
  const [error, setError] = useState("")

  // Invite member dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        // Fetch team details by listing all teams and finding the matching one
        const teamsResult = await authClient.organization.listTeams({
          query: {
            organizationId: orgId,
          },
        })

        if (teamsResult.data) {
          const teams = teamsResult.data as any[]
          const currentTeam = teams.find((t: any) => t.id === teamId)
          if (currentTeam) {
            setTeamDetail({
              id: currentTeam.id,
              name: currentTeam.name,
              organizationId: currentTeam.organizationId,
              createdAt: new Date(currentTeam.createdAt),
              updatedAt: new Date(currentTeam.updatedAt),
            })
          }
        }

        // Fetch team members
        const membersResult = await authClient.organization.listTeamMembers({
          query: {
            teamId,
          },
        })

        if (membersResult.data) {
          const rawMembers = membersResult.data as any[]

          // Better Auth listTeamMembers doesn't populate user data
          // We need to fetch user details from organization members
          const orgMembersForUserData = await authClient.$fetch('/organization/list-members', {
            method: 'GET',
            query: { organizationId: orgId },
          })

          // Build a user lookup map
          const userMap = new Map()
          const orgMembersData = (orgMembersForUserData as any)?.members || (orgMembersForUserData as any)?.data?.members || []
          orgMembersData.forEach((m: any) => {
            if (m.user) {
              userMap.set(m.userId, m.user)
            }
          })

          // Enrich team members with user data
          const membersList = rawMembers
            .filter(m => {
              if (!m) {
                console.warn('⚠️ [Team] Skipping null team member')
                return false
              }
              const userData = userMap.get(m.userId)
              if (!userData) {
                console.warn('⚠️ [Team] No user data found for team member:', m.userId)
                return false
              }
              return true
            })
            .map((m: any) => ({
              id: m.id,
              userId: m.userId,
              teamId: m.teamId,
              createdAt: new Date(m.createdAt),
              user: userMap.get(m.userId),
            }))

          console.log('✅ [Team] Loaded team members with user data:', membersList)
          setMembers(membersList)
        }

        // Fetch organization members for adding
        const orgMembersResult = await authClient.$fetch('/organization/list-members', {
          method: 'GET',
          query: { organizationId: orgId },
        })

        console.log('📋 [Team] Organization members response:', orgMembersResult)

        // Handle different response formats
        let orgMembers: any[] = []

        // Response format: { members: [...], total: number }
        if (orgMembersResult && Array.isArray((orgMembersResult as any).members)) {
          orgMembers = (orgMembersResult as any).members
        }
        // Response format: { data: { members: [...] } }
        else if ((orgMembersResult as any)?.data && Array.isArray((orgMembersResult as any).data.members)) {
          orgMembers = (orgMembersResult as any).data.members
        }
        // Response format: [...]
        else if (Array.isArray(orgMembersResult)) {
          orgMembers = orgMembersResult as any[]
        }

        console.log('📋 [Team] Parsed organization members:', orgMembers)
        setOrganizationMembers(orgMembers)
      } catch (error) {
        console.error("Failed to fetch team details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamDetails()
  }, [orgId, teamId])

  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError("Please select a member")
      return
    }

    setAddMemberLoading(true)
    setError("")

    try {
      // Ensure the active organization matches the team's organization
      // Better Auth validates teams against the user's active organization
      if (activeOrganization?.id !== orgId) {
        console.log('🔄 [Team] Syncing active organization before adding member:', {
          currentActiveOrg: activeOrganization?.id,
          teamOrg: orgId
        })
        await authClient.organization.setActive({ organizationId: orgId })
      }

      const result = await authClient.organization.addTeamMember({
        teamId,
        userId: selectedUserId,
      })

      if (result.error) {
        setError(result.error.message || "Failed to add member")
      } else {
        // Refresh members list with user data enrichment
        const membersResult = await authClient.organization.listTeamMembers({
          query: {
            teamId,
          },
        })

        if (membersResult.data) {
          const rawMembers = membersResult.data as any[]

          // Fetch organization members to get user data
          const orgMembersForUserData = await authClient.$fetch('/organization/list-members', {
            method: 'GET',
            query: { organizationId: orgId },
          })

          // Build user lookup map
          const userMap = new Map()
          const orgMembersData = (orgMembersForUserData as any)?.members || (orgMembersForUserData as any)?.data?.members || []
          orgMembersData.forEach((m: any) => {
            if (m.user) {
              userMap.set(m.userId, m.user)
            }
          })

          // Enrich team members with user data
          const membersList = rawMembers
            .filter(m => m && userMap.has(m.userId))
            .map((m: any) => ({
              id: m.id,
              userId: m.userId,
              teamId: m.teamId,
              createdAt: new Date(m.createdAt),
              user: userMap.get(m.userId),
            }))

          console.log('✅ [Team] Refreshed team members after add:', membersList)
          setMembers(membersList)
        }

        setAddMemberDialogOpen(false)
        setSelectedUserId("")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setAddMemberLoading(false)
    }
  }

  const handleInviteMember = async () => {
    setInviteLoading(true)
    setInviteError("")
    setInviteSuccess("")

    console.log('📧 [Team] Inviting member to team:', { orgId, teamId, email: inviteEmail, role: inviteRole })

    try {
      const result = await authClient.organization.inviteMember({
        organizationId: orgId,
        email: inviteEmail,
        role: inviteRole,
        teamId: teamId, // Pre-fill with current team - invited user joins org AND team
      })

      console.log('📧 [Team] Invite member result:', result)

      if (result.error) {
        console.error('❌ [Team] Failed to invite member:', result.error)
        setInviteError(result.error.message || "Failed to send invitation")
      } else {
        console.log('✅ [Team] Invitation sent successfully')
        setInviteSuccess(`Invitation sent to ${inviteEmail}! They will be added to this team when they accept.`)
        setInviteEmail("")
        setInviteRole("member")

        setTimeout(() => {
          setInviteDialogOpen(false)
          setInviteSuccess("")
        }, 2000)
      }
    } catch (error: any) {
      console.error('❌ [Team] Invite error:', error)
      setInviteError(error.message || "An error occurred")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member from the team?")) {
      return
    }

    try {
      // Ensure the active organization matches the team's organization
      // Better Auth validates teams against the user's active organization
      if (activeOrganization?.id !== orgId) {
        console.log('🔄 [Team] Syncing active organization before removing member:', {
          currentActiveOrg: activeOrganization?.id,
          teamOrg: orgId
        })
        await authClient.organization.setActive({ organizationId: orgId })
      }

      await authClient.organization.removeTeamMember({
        teamId,
        userId,
      })

      // Remove from local state
      setMembers(members.filter((m) => m.userId !== userId))
      console.log('✅ [Team] Member removed successfully')
    } catch (error: any) {
      console.error("Failed to remove member:", error)
      alert(error.message || "Failed to remove member")
    }
  }

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

  if (!teamDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <BackButton href={`/organizations/${orgId}/teams`} />
          <Card className="mt-6">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Team not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Get members not in team yet (also filter out members without user data)
  const availableMembers = organizationMembers.filter(
    (orgMember) => orgMember.user && !members.some((teamMember) => teamMember.userId === orgMember.userId)
  )

  console.log('📊 [Team] Member statistics:', {
    organizationMembers: organizationMembers.length,
    currentTeamMembers: members.length,
    availableToAdd: availableMembers.length,
    orgMemberIds: organizationMembers.map(m => m.userId),
    teamMemberIds: members.map(m => m.userId),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <BackButton href={`/organizations/${orgId}/teams`} />

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{teamDetail.name}</h1>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {members.length} members
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Created {teamDetail.createdAt.toLocaleDateString()}
            </p>
          </div>
          <Link href={`/organizations/${orgId}/teams/${teamId}/settings`}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Members of this team within the organization
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Member to Team</DialogTitle>
                      <DialogDescription>
                        Send an invitation email to add a new member directly to this team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          autoComplete="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="member@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Role</Label>
                        <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as "member" | "admin")}>
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

                <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={availableMembers.length === 0}>
                      Add Member
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Select an organization member to add to this team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Member</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers.map((member) => (
                            <SelectItem key={member.userId} value={member.userId}>
                              {member.user?.name || member.user?.email || 'Unknown User'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddMemberDialogOpen(false)}
                      disabled={addMemberLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMember}
                      disabled={!selectedUserId || addMemberLoading}
                    >
                      {addMemberLoading ? "Adding..." : "Add Member"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No members in this team yet. Add members to get started.
                </p>
              </div>
            ) : (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.userId)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
