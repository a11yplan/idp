"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
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
import { Input } from "@/components/ui/input"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: boolean
  banned: boolean
  banReason: string | null
  banExpires: number | null
  createdAt: Date
  updatedAt: Date
  image: string | null
}

interface AdminUserDetailClientProps {
  user: User
  currentUserId: string
}

export function AdminUserDetailClient({ user: initialUser, currentUserId }: AdminUserDetailClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<User>(initialUser)

  // Role change dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState<"admin" | "user">(initialUser.role as "admin" | "user")
  const [roleLoading, setRoleLoading] = useState(false)

  // Ban dialog
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banLoading, setBanLoading] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleChangeRole = async () => {
    setRoleLoading(true)
    try {
      await authClient.admin.setRole({
        userId: user.id,
        role: newRole,
      })

      setUser((prev) => ({ ...prev, role: newRole }))
      setRoleDialogOpen(false)
    } catch (error: any) {
      alert(error.message || "Failed to change role")
    } finally {
      setRoleLoading(false)
    }
  }

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      alert("Please provide a ban reason")
      return
    }

    setBanLoading(true)
    try {
      await authClient.admin.banUser({
        userId: user.id,
        banReason,
      })

      setUser((prev) => ({ ...prev, banned: true, banReason }))
      setBanDialogOpen(false)
      setBanReason("")
    } catch (error: any) {
      alert(error.message || "Failed to ban user")
    } finally {
      setBanLoading(false)
    }
  }

  const handleUnbanUser = async () => {
    try {
      await authClient.admin.unbanUser({ userId: user.id })
      setUser((prev) => ({ ...prev, banned: false, banReason: null }))
    } catch (error: any) {
      alert(error.message || "Failed to unban user")
    }
  }

  const handleImpersonateUser = async () => {
    try {
      await authClient.admin.impersonateUser({ userId: user.id })

      // Force session refresh before redirect
      await authClient.getSession()

      // Full page reload to ensure session updates
      window.location.href = "/"
    } catch (error: any) {
      console.error("[Impersonation] Failed:", error)
      alert(error.message || "Failed to impersonate user")
    }
  }

  const handleDeleteUser = async () => {
    if (deleteConfirmation !== "DELETE") {
      return
    }

    setDeleteLoading(true)
    try {
      await authClient.admin.removeUser({ userId: user.id })
      router.push("/admin/users")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to delete user")
      setDeleteLoading(false)
    }
  }

  const isCurrentUser = currentUserId === user.id
  const isOwner = user.role === "owner"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <BackButton href="/admin/users" />

        <div>
          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground">
            View and manage user information
          </p>
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Basic account details</CardDescription>
              </div>
              <Badge variant={user.role === "owner" ? "default" : user.role === "admin" ? "secondary" : "outline"}>
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{user.name || "No name set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email Verified</Label>
                <div className="mt-1">
                  {user.emailVerified ? (
                    <Badge variant="secondary">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Unverified</Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Status</Label>
                <div className="mt-1">
                  {user.banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {user.banned && user.banReason && (
              <div>
                <Label className="text-muted-foreground">Ban Reason</Label>
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{user.banReason}</AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>
              Manage user permissions and account status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {/* Change Role */}
              <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isOwner}>
                    Change Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change User Role</DialogTitle>
                    <DialogDescription>
                      Update the user&apos;s role and permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newRole} onValueChange={(value) => setNewRole(value as "admin" | "user")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleChangeRole}
                      disabled={roleLoading || newRole === user.role}
                    >
                      {roleLoading ? "Changing..." : "Change Role"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Ban/Unban User */}
              {user.banned ? (
                <Button
                  variant="outline"
                  onClick={handleUnbanUser}
                  disabled={isOwner}
                >
                  Unban User
                </Button>
              ) : (
                <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={isOwner}>
                      Ban User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ban User</DialogTitle>
                      <DialogDescription>
                        Provide a reason for banning this user
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="banReason">Ban Reason</Label>
                        <Input
                          id="banReason"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Violation of terms of service..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={handleBanUser}
                        disabled={banLoading || !banReason.trim()}
                      >
                        {banLoading ? "Banning..." : "Ban User"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Impersonate User */}
              <Button
                variant="secondary"
                onClick={handleImpersonateUser}
                disabled={isCurrentUser}
              >
                Impersonate User
              </Button>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-4 pt-4">
              <div>
                <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Irreversible actions that permanently affect this user account
                </p>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={isOwner || isCurrentUser}>
                      Delete User Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete
                        the user account and remove all associated data.
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
                        onClick={handleDeleteUser}
                        disabled={deleteConfirmation !== "DELETE" || deleteLoading}
                      >
                        {deleteLoading ? "Deleting..." : "Delete User"}
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
