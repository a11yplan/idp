import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { auth } from '../../../../lib/auth'
import { loadMessages } from '../../../../lib/i18n'
import { BackButton } from '../../../../components/navigation/back-button'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { useState, useEffect, useCallback } from 'react'
import { authClient } from '../../../../lib/auth-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'
import { Badge } from '../../../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu'
import { MoreHorizontal, UserPlus, Mail, Clock, X } from 'lucide-react'

export const Route = createFileRoute('/organizations/$id/members/')({
  loader: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw redirect({ to: '/login' })
    const messages = await loadMessages('en')
    return { session, messages, organizationId: params.id }
  },
  component: OrganizationMembersPage,
})

interface Member {
  id: string
  userId: string
  organizationId: string
  role: string
  createdAt: string
  email: string
  name: string | null
  image: string | null
}

interface PendingInvitation {
  id: string
  organizationId: string
  email: string
  role: string
  expiresAt: string
  status: string
  inviterId: string
  createdAt: string
}

interface Team {
  id: string
  name: string
  slug: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

function OrganizationMembersPage() {
  const { session, organizationId } = Route.useLoaderData()
  const navigate = useNavigate()

  const [members, setMembers] = useState<Member[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteTeamId, setInviteTeamId] = useState<string | undefined>(undefined)
  const [sendingInvite, setSendingInvite] = useState(false)

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch members
      const membersRes = await authClient.$fetch('/organization/list-members', {
        method: 'POST',
        body: JSON.stringify({ organizationId }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (membersRes.error) {
        toast({
          title: 'Error',
          description: 'Failed to load members',
          variant: 'destructive',
        })
        return
      }

      const membersList = membersRes.data?.members || []
      setMembers(membersList)

      // Find current user's role
      const currentUserMember = membersList.find(
        (m: Member) => m.userId === session.user.id
      )
      setUserRole(currentUserMember?.role || null)

      // Fetch pending invitations (only if owner/admin)
      if (currentUserMember && (currentUserMember.role === 'owner' || currentUserMember.role === 'admin')) {
        const invitationsRes = await authClient.$fetch('/organization/list-invitations', {
          method: 'POST',
          body: JSON.stringify({ organizationId }),
          headers: { 'Content-Type': 'application/json' },
        })

        if (!invitationsRes.error) {
          const invitations = invitationsRes.data?.invitations || []
          setPendingInvitations(
            invitations.filter((inv: PendingInvitation) => inv.status === 'pending')
          )
        }
      }

      // Fetch teams for invite dialog
      const org = await authClient.organization.getFullOrganization({
        organizationId,
      })

      if (org.data) {
        const orgTeams = org.data.members
          .flatMap(m => m.teams || [])
          .filter((team, index, self) =>
            index === self.findIndex(t => t.id === team.id)
          )
        setTeams(orgTeams)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load organization data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [organizationId, session.user.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      })
      return
    }

    try {
      setSendingInvite(true)

      const result = await authClient.organization.inviteMember({
        organizationId,
        email: inviteEmail,
        role: inviteRole,
        ...(inviteTeamId && { teamId: inviteTeamId }),
      })

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error.message || 'Failed to send invitation',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: `Invitation sent to ${inviteEmail}`,
      })

      // Reset form and close dialog
      setInviteEmail('')
      setInviteRole('member')
      setInviteTeamId(undefined)
      setInviteDialogOpen(false)

      // Refresh data
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      })
    } finally {
      setSendingInvite(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {

      const result = await authClient.organization.cancelInvitation({
        invitationId,
      })

      if (result.error) {
        toast({
          title: 'Error',
          description: 'Failed to cancel invitation',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Invitation canceled',
      })

      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {

      const result = await authClient.organization.updateMemberRole({
        organizationId,
        userId,
        role: newRole,
      })

      if (result.error) {
        toast({
          title: 'Error',
          description: 'Failed to update member role',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Member role updated',
      })

      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {

      const result = await authClient.organization.removeMember({
        organizationId,
        userId,
      })

      if (result.error) {
        toast({
          title: 'Error',
          description: 'Failed to remove member',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Member removed from organization',
      })

      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffMs = expires.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`
    return 'Expires soon'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <BackButton to={`/organizations/${organizationId}`} />
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <BackButton to={`/organizations/${organizationId}`} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-muted-foreground">
              Manage organization members and invitations
            </p>
          </div>

          {isOwnerOrAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="member@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {userRole === 'owner' && (
                          <SelectItem value="owner">Owner</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {teams.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="team">Team (Optional)</Label>
                      <Select
                        value={inviteTeamId}
                        onValueChange={(value) =>
                          setInviteTeamId(value === 'none' ? undefined : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No team</SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleInviteMember} disabled={sendingInvite}>
                    {sendingInvite ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Pending Invitations */}
        {isOwnerOrAdmin && pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Invitations waiting to be accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invitation.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(invitation.role)}>
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {getTimeRemaining(invitation.expiresAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Current Members */}
        <Card>
          <CardHeader>
            <CardTitle>Current Members</CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? 's' : ''} in this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {isOwnerOrAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isCurrentUser = member.userId === session.user.id
                  const canManage = isOwnerOrAdmin && !isCurrentUser && member.role !== 'owner'

                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name || 'No name'}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      {isOwnerOrAdmin && (
                        <TableCell className="text-right">
                          {canManage ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.userId, 'member')}
                                  disabled={member.role === 'member'}
                                >
                                  Set as Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.userId, 'admin')}
                                  disabled={member.role === 'admin'}
                                >
                                  Set as Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRemoveMember(member.userId)}
                                  className="text-destructive"
                                >
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
