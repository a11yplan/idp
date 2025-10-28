"use client"

import { useEffect, useState } from "react"
import { useSession, admin } from "@/lib/auth-client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  const { data: session, isPending } = useSession()
  const [stats, setStats] = useState({ users: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user count
        const usersResult = await admin.listUsers({ query: {} })

        setStats({
          users: usersResult.data?.users?.length || 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchStats()
    }
  }, [session])

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "owner"

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Alert variant="destructive">
            <AlertDescription>
              You don&apos;t have permission to access the admin panel.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and management</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
              <CardDescription>Registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.users}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
              <CardDescription>System health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">✓ Healthy</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/admin/users">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View all users, edit profiles, manage roles, ban/unban users
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/organizations">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>
                  View and manage organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View all organizations and their members
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
