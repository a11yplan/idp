import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { auth } from '../../../../lib/auth'
import { loadMessages } from '../../../../lib/i18n'
import { BackButton } from '../../../../components/navigation/back-button'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Skeleton } from '../../../../components/ui/skeleton'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog'
import { Users, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { authClient } from '../../../../lib/auth-client'

export const Route = createFileRoute('/organizations/$id/teams/')({
  loader: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw redirect({ to: '/login' })
    const messages = await loadMessages('en')
    return { session, messages, organizationId: params.id }
  },
  component: TeamsListPage,
})

interface Team {
  id: string
  name: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  memberCount?: number
}

function TeamsListPage() {
  const { organizationId } = Route.useLoaderData()

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const result = await authClient.organization.listTeams({
          query: {
            organizationId,
          },
        })

        if (result.data) {
          const teamsList = (result.data as any[]).map((t: any) => ({
            id: t.id,
            name: t.name,
            organizationId: t.organizationId,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            memberCount: 0, // Will be fetched separately if needed
          }))
          setTeams(teamsList)
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [organizationId])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setError('Team name is required')
      return
    }

    setCreateLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await authClient.organization.createTeam({
        name: newTeamName,
        organizationId,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to create team')
      } else {
        setSuccess('Team created successfully!')
        setNewTeamName('')

        // Refresh teams list
        const refreshResult = await authClient.organization.listTeams({
          query: {
            organizationId,
          },
        })

        if (refreshResult.data) {
          const teamsList = (refreshResult.data as any[]).map((t: any) => ({
            id: t.id,
            name: t.name,
            organizationId: t.organizationId,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            memberCount: 0,
          }))
          setTeams(teamsList)
        }

        setTimeout(() => {
          setCreateDialogOpen(false)
          setSuccess('')
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setCreateLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <BackButton to={`/organizations/${organizationId}`} />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-muted-foreground">Organize your organization members into teams</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a team to organize members within your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Engineering, Sales, Marketing..."
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={createLoading || !newTeamName.trim()}
                >
                  {createLoading ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {teams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No teams yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first team to start organizing your organization members.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <Link key={t.id} to={`/organizations/${organizationId}/teams/${t.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{t.name}</CardTitle>
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>
                      {t.memberCount || 0} members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Created {t.createdAt.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
