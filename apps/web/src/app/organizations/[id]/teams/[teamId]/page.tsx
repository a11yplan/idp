"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useParams, useRouter } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
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
          const membersList = (membersResult.data as any[]).map((m: any) => ({
            id: m.id,
            userId: m.userId,
            teamId: m.teamId,
            createdAt: new Date(m.createdAt),
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
              image: m.user.image,
            },
          }))
          setMembers(membersList)
        }

        // Fetch organization members for adding
        const orgMembersResult = await authClient.$fetch('/organization/list-members', {
          method: 'GET',
          query: { organizationId: orgId },
        })

        const data = orgMembersResult.data as any
        if (data && Array.isArray(data.members)) {
          setOrganizationMembers(data.members)
        } else if (Array.isArray(orgMembersResult)) {
          setOrganizationMembers(orgMembersResult as any[])
        } else if (orgMembersResult && Array.isArray((orgMembersResult as any).members)) {
          setOrganizationMembers((orgMembersResult as any).members)
        }
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
      const result = await authClient.organization.addTeamMember({
        teamId,
        userId: selectedUserId,
      })

      if (result.error) {
        setError(result.error.message || "Failed to add member")
      } else {
        // Refresh members list
        const membersResult = await authClient.organization.listTeamMembers({
          query: {
            teamId,
          },
        })

        if (membersResult.data) {
          const membersList = (membersResult.data as any[]).map((m: any) => ({
            id: m.id,
            userId: m.userId,
            teamId: m.teamId,
            createdAt: new Date(m.createdAt),
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
              image: m.user.image,
            },
          }))
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

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member from the team?")) {
      return
    }

    try {
      await authClient.organization.removeTeamMember({
        teamId,
        userId,
      })

      // Remove from local state
      setMembers(members.filter((m) => m.userId !== userId))
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

  // Get members not in team yet
  const availableMembers = organizationMembers.filter(
    (orgMember) => !members.some((teamMember) => teamMember.userId === orgMember.userId)
  )

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
                              {member.user.name || member.user.email}
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
