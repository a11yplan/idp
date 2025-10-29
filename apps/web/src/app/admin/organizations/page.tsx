"use client"


import { useEffect, useState } from "react"
import { useSession, admin } from "@/lib/auth-client"
import Link from "next/link"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
  slug: string
  createdAt: Date
  metadata?: {
    description?: string
  }
  members?: any[]
}

export default function AdminOrganizationsPage() {
  const { data: session, isPending } = useSession()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        // Note: Better Auth admin plugin doesn't have a listOrganizations method
        // We'll need to use a custom approach or extend the admin plugin
        // For now, we'll fetch using the organization client which will only show
        // organizations the admin user is part of
        // In production, you'd want to add a custom API endpoint to fetch all orgs

        // Placeholder: In a real implementation, you'd call a custom API endpoint
        // const response = await fetch('/api/admin/organizations')
        // const data = await response.json()

        setOrganizations([])
      } catch (error) {
        console.error("Failed to fetch organizations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchOrganizations()
    }
  }, [session])

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

  // Filter organizations based on search
  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      searchQuery === "" ||
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <BackButton href="/admin" />

        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            View and manage all organizations
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Organizations ({filteredOrganizations.length})</CardTitle>
            <CardDescription>
              Browse and manage organization accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <Input
                placeholder="Search by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Organizations Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="space-y-2">
                            <p className="text-muted-foreground">
                              {searchQuery
                                ? "No organizations found matching your search"
                                : "No organizations yet"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Note: Organization listing requires a custom API endpoint.
                              The Better Auth admin plugin doesn&apos;t include organization
                              management out of the box.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrganizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{org.name}</p>
                              {org.metadata?.description && (
                                <p className="text-sm text-muted-foreground">
                                  {org.metadata.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-mono text-sm">@{org.slug}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {org.members?.length || 0} members
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {new Date(org.createdAt).toLocaleDateString()}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/organizations/${org.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
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

        {/* Implementation Note */}
        <Alert>
          <AlertDescription>
            <strong>Implementation Note:</strong> To fully implement organization
            management, you&apos;ll need to create a custom API endpoint at{" "}
            <code>/api/admin/organizations/route.ts</code> that queries the database
            directly to list all organizations. The Better Auth admin plugin doesn&apos;t
            include organization listing functionality by default.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
