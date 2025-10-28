"use client"


import { useEffect, useState } from "react"
import { organization } from "@/lib/auth-client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'

interface OrganizationDetail {
  id: string
  name: string
  slug: string
  metadata?: any
  createdAt: Date
  members?: any[]
}

export default function OrganizationDetailPage() {
  const params = useParams()
  const orgId = params.id as string

  const [org, setOrg] = useState<OrganizationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const result = await organization.getFullOrganization({
          query: {
            organizationId: orgId,
          },
        })

        if (result.data) {
          setOrg(result.data as any)

          // Get user's role in this organization
          const listResult = await organization.list()
          if (listResult.data) {
            const userOrg = (listResult.data as any[]).find((o: any) => o.id === orgId)
            if (userOrg) {
              setUserRole(userOrg.role)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [orgId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <BackButton href="/organizations" />
          <Card className="mt-6">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Organization not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isOwnerOrAdmin = userRole === "owner" || userRole === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <BackButton href="/organizations" />

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{org.name}</h1>
              <Badge>{userRole}</Badge>
            </div>
            <p className="text-muted-foreground">@{org.slug}</p>
          </div>
          {isOwnerOrAdmin && (
            <Link href={`/organizations/${orgId}/settings`}>
              <Button variant="outline">Settings</Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Organization information and statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {org.metadata?.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="text-sm">{org.metadata.description}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Members</h3>
                <p className="text-2xl font-bold">{org.members?.length || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                <p className="text-sm">{new Date(org.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={`/organizations/${orgId}/members`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="font-medium">Members</p>
                  <p className="text-xs text-muted-foreground">
                    Manage team members and roles
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {isOwnerOrAdmin && (
            <Link href={`/organizations/${orgId}/settings`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardContent className="flex items-center p-6">
                  <div className="flex-1">
                    <p className="font-medium">Settings</p>
                    <p className="text-xs text-muted-foreground">
                      Configure organization settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
