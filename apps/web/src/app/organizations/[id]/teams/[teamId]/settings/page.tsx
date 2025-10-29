"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useParams, useRouter } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const dynamic = 'force-dynamic'

interface TeamDetail {
  id: string
  name: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export default function TeamSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string
  const teamId = params.teamId as string

  const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchTeam = async () => {
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
            const teamData = {
              id: currentTeam.id,
              name: currentTeam.name,
              organizationId: currentTeam.organizationId,
              createdAt: new Date(currentTeam.createdAt),
              updatedAt: new Date(currentTeam.updatedAt),
            }
            setTeamDetail(teamData)
            setName(currentTeam.name)
          }
        }
      } catch (error) {
        console.error("Failed to fetch team:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [orgId, teamId])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await authClient.organization.updateTeam({
        teamId,
        data: {
          name,
          organizationId: orgId,
        },
      })

      if (result.error) {
        setError(result.error.message || "Failed to update team")
      } else {
        setSuccess("Team updated successfully!")
        // Update local state
        if (teamDetail) {
          setTeamDetail({
            ...teamDetail,
            name,
          })
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirmation !== "DELETE") {
      return
    }

    setDeleteLoading(true)
    try {
      await authClient.organization.removeTeam({
        teamId,
        organizationId: orgId,
      })
      router.push(`/organizations/${orgId}/teams`)
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to delete team")
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!teamDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <BackButton href={`/organizations/${orgId}/teams/${teamId}`} />
        <div>
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-muted-foreground">Manage team details and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your team's basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
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

              <Button type="submit" disabled={updateLoading}>
                {updateLoading ? "Updating..." : "Update Team"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Delete Team</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete a team, there is no going back. This will remove
                  all team members from the team.
                </p>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Team</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the
                        team and remove all members from it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Type DELETE to confirm</Label>
                        <Input
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="DELETE"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteConfirmation !== "DELETE" || deleteLoading}
                      >
                        {deleteLoading ? "Deleting..." : "Delete Team"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
