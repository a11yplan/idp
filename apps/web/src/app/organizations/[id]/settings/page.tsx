"use client"


import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useParams, useRouter } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export default function OrganizationSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const orgId = params.id as string

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userRole, setUserRole] = useState<string>("")

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Leave dialog
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveLoading, setLeaveLoading] = useState(false)

  // Transfer ownership dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [transferUserId, setTransferUserId] = useState("")
  const [transferLoading, setTransferLoading] = useState(false)
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const result = await authClient.organization.getFullOrganization({
          query: {
            organizationId: orgId,
          },
        })

        if (result.data) {
          const org = result.data as any
          setName(org.name)
          setSlug(org.slug)
          setDescription(org.metadata?.description || "")
        }

        // Get user's role
        const listResult = await authClient.organization.list()
        if (listResult.data) {
          const userOrg = (listResult.data as any[]).find((o: any) => o.id === orgId)
          if (userOrg) {
            setUserRole(userOrg.role)
          }
        }

        // Fetch members for transfer ownership (owners only) using explicit GET
        const membersResult = await authClient.$fetch('/organization/list-members', {
          method: 'GET',
          query: { organizationId: orgId },
        })

        // Handle response format: { data: { members: [...], total: 1 }, error: null }
        const data = membersResult.data as any
        if (data && Array.isArray(data.members)) {
          setMembers(data.members)
        } else if (Array.isArray(membersResult)) {
          setMembers(membersResult as any[])
        } else if (membersResult && Array.isArray((membersResult as any).members)) {
          setMembers((membersResult as any).members)
        } else {
          setMembers([])
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [orgId])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await authClient.organization.update({
        organizationId: orgId,
        data: {
          name,
          slug,
          metadata: description ? { description } : undefined,
        },
      })

      if (result.error) {
        setError(result.error.message || "Failed to update organization")
      } else {
        setSuccess("Organization updated successfully!")
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
      await authClient.organization.delete({
        organizationId: orgId,
      })
      router.push("/organizations")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to delete organization")
      setDeleteLoading(false)
    }
  }

  const handleLeave = async () => {
    setLeaveLoading(true)
    try {
      // Correct method: organization.leave with explicit organizationId
      await authClient.organization.leave({
        organizationId: orgId,
      })
      router.push("/organizations")
      router.refresh()
    } catch (error: any) {
      console.error("Leave organization error:", error)
      alert(error.message || "Failed to leave organization")
      setLeaveLoading(false)
      setLeaveDialogOpen(false)
    }
  }

  const handleTransfer = async () => {
    if (!transferUserId) {
      return
    }

    setTransferLoading(true)
    try {
      // Custom implementation: transferOwnership doesn't exist in better-auth
      // We need to: 1) Set new user as owner, 2) Demote current owner to admin

      // Step 1: Promote new user to owner
      const promoteResult = await authClient.organization.updateMemberRole({
        organizationId: orgId,
        memberId: transferUserId,
        role: "owner",
      })

      if (promoteResult.error) {
        throw new Error(promoteResult.error.message || "Failed to promote new owner")
      }

      // Step 2: Demote current owner to admin (using session user ID)
      const demoteResult = await authClient.organization.updateMemberRole({
        organizationId: orgId,
        memberId: session?.user?.id || "",
        role: "admin",
      })

      if (demoteResult.error) {
        // Try to revert the promotion
        await authClient.organization.updateMemberRole({
          organizationId: orgId,
          memberId: transferUserId,
          role: "admin", // revert to previous role
        })
        throw new Error(demoteResult.error.message || "Failed to demote current owner")
      }

      alert("Ownership transferred successfully!")
      router.push("/organizations")
      router.refresh()
    } catch (error: any) {
      console.error("Transfer ownership error:", error)
      alert(error.message || "Failed to transfer ownership")
      setTransferLoading(false)
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

  const isOwner = userRole === "owner"
  const isOwnerOrAdmin = userRole === "owner" || userRole === "admin"

  if (!isOwnerOrAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <BackButton href={`/organizations/${orgId}`} />
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>
              You don&apos;t have permission to access organization settings.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <BackButton href={`/organizations/${orgId}`} />
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">Manage organization details and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your organization's basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
                {updateLoading ? "Updating..." : "Update Organization"}
              </Button>
            </form>
          </CardContent>
        </Card>

{!isOwner && isOwnerOrAdmin && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Leave Organization</CardTitle>
              <CardDescription>
                Remove yourself from this organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  You will lose access to this organization and all its resources.
                  This action cannot be undone.
                </p>
                <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Leave Organization</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        You will be removed from this organization and lose all access.
                        If you want to rejoin, you'll need to be invited again.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setLeaveDialogOpen(false)}
                        disabled={leaveLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleLeave}
                        disabled={leaveLoading}
                      >
                        {leaveLoading ? "Leaving..." : "Leave Organization"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Transfer Ownership</CardTitle>
                <CardDescription>
                  Transfer ownership of this organization to another member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Transfer complete ownership and control to another member.
                    You will become an admin after the transfer.
                  </p>
                  <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Transfer Ownership</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Transfer Organization Ownership</DialogTitle>
                        <DialogDescription>
                          Select a member to transfer ownership to. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select New Owner</Label>
                          <Select value={transferUserId} onValueChange={setTransferUserId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a member" />
                            </SelectTrigger>
                            <SelectContent>
                              {members
                                .filter((m) => m.role !== "owner")
                                .map((member) => (
                                  <SelectItem key={member.userId} value={member.userId}>
                                    {member.user.name || member.user.email} ({member.role})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setTransferDialogOpen(false)}
                          disabled={transferLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleTransfer}
                          disabled={!transferUserId || transferLoading}
                        >
                          {transferLoading ? "Transferring..." : "Transfer Ownership"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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
                    <h3 className="font-medium mb-2">Delete Organization</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete an organization, there is no going back. This will remove
                      all members and data associated with this organization.
                    </p>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Delete Organization</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete the
                          organization and remove all members.
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
                          {deleteLoading ? "Deleting..." : "Delete Organization"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
