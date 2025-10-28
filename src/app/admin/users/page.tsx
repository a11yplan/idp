"use client"

import { useEffect, useState } from "react"
import { useSession, admin } from "@/lib/auth-client"
import Link from "next/link"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const dynamic = 'force-dynamic'

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
}

export default function AdminUsersPage() {
  const { data: session, isPending } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await admin.listUsers({ query: {} })
        if (result.data?.users) {
          setUsers(result.data.users as any)
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchUsers()
    }
  }, [session])

  const handleBanUser = async (userId: string) => {
    const reason = prompt("Enter ban reason:")
    if (!reason) return

    try {
      await admin.banUser({
        userId,
        banReason: reason,
      })

      // Refresh users list
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, banned: true, banReason: reason } : u
      ))
    } catch (error: any) {
      alert(error.message || "Failed to ban user")
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await admin.unbanUser({ userId })

      // Refresh users list
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, banned: false, banReason: null } : u
      ))
    } catch (error: any) {
      alert(error.message || "Failed to unban user")
    }
  }

  const handleImpersonateUser = async (userId: string) => {
    try {
      await admin.impersonateUser({ userId })
      window.location.href = "/"
    } catch (error: any) {
      alert(error.message || "Failed to impersonate user")
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "owner"

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <BackButton href="/admin" />
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>
              You don&apos;t have permission to access the admin panel.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !user.banned) ||
      (statusFilter === "banned" && user.banned) ||
      (statusFilter === "verified" && user.emailVerified) ||
      (statusFilter === "unverified" && !user.emailVerified)

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <BackButton href="/admin" />

        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Search, filter, and manage user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No users found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {user.name || "No name"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {user.banned ? (
                                <Badge variant="destructive">Banned</Badge>
                              ) : (
                                <Badge variant="outline">Active</Badge>
                              )}
                              {user.emailVerified ? (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Unverified
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/users/${user.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              {user.banned ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnbanUser(user.id)}
                                >
                                  Unban
                                </Button>
                              ) : (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleBanUser(user.id)}
                                  disabled={user.role === "owner"}
                                >
                                  Ban
                                </Button>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleImpersonateUser(user.id)}
                                disabled={user.id === session.user.id}
                              >
                                Impersonate
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
