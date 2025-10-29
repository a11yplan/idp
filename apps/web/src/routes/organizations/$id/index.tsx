import { useEffect, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { loadMessages } from '../../../lib/i18n'
import { authClient } from '../../../lib/auth-client'
import { BackButton } from '../../../components/navigation/back-button'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Skeleton } from '../../../components/ui/skeleton'

interface OrganizationDetail {
  id: string
  name: string
  slug: string
  metadata?: any
  createdAt: Date
  members?: any[]
  teamsCount?: number
}

export const Route = createFileRoute('/organizations/$id/')({
  loader: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw redirect({ to: '/login' })
    const messages = await loadMessages('en')
    return { session, messages, organizationId: params.id }
  },
  component: OrganizationDetailPage,
})

function OrganizationDetailPage() {
  const { messages, organizationId: orgId } = Route.useLoaderData()

  const [org, setOrg] = useState<OrganizationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const [teamsCount, setTeamsCount] = useState(0)

  const t = (namespace: string, key: string) => {
    const keys = `${namespace}.${key}`.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const result = await authClient.organization.getFullOrganization({
          query: {
            organizationId: orgId,
          },
        })

        if (result.data) {
          setOrg(result.data as any)

          // Get user's role in this organization
          const listResult = await authClient.organization.list()
          if (listResult.data) {
            const userOrg = (listResult.data as any[]).find((o: any) => o.id === orgId)
            if (userOrg) {
              setUserRole(userOrg.role)
            }
          }

          // Fetch teams count
          const teamsResult = await authClient.organization.listTeams({
            query: {
              organizationId: orgId,
            },
          })
          if (teamsResult.data) {
            setTeamsCount((teamsResult.data as any[]).length)
          }
        }
      } catch (error) {
        // Error handled silently - user will see not found state
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
              <p className="text-muted-foreground">{t('organizations', 'noOrganizations')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <BackButton href="/organizations" />

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{org.name}</h1>
              <Badge>{t('organizations', userRole as 'owner' | 'admin' | 'member')}</Badge>
            </div>
            <p className="text-muted-foreground">@{org.slug}</p>
          </div>
          {isOwnerOrAdmin && (
            <Link to={`/organizations/${orgId}/settings`}>
              <Button variant="outline">{t('organizations', 'settings')}</Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('organizations', 'title')}</CardTitle>
            <CardDescription>{t('organizations', 'myOrganizations')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {org.metadata?.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('organizations', 'organizationDescription')}</h3>
                <p className="text-sm">{org.metadata.description}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('organizations', 'members')}</h3>
                <p className="text-2xl font-bold">{org.members?.length || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Teams</h3>
                <p className="text-2xl font-bold">{teamsCount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('organizations', 'created')}</h3>
                <p className="text-sm">{new Date(org.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to={`/organizations/${orgId}/members`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="font-medium">{t('organizations', 'members')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('organizations', 'manageMembers')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={`/organizations/${orgId}/teams`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="font-medium">Teams</p>
                  <p className="text-xs text-muted-foreground">
                    Manage teams and assignments
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {isOwnerOrAdmin && (
            <Link to={`/organizations/${orgId}/settings`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardContent className="flex items-center p-6">
                  <div className="flex-1">
                    <p className="font-medium">{t('organizations', 'settings')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('organizations', 'organizationDescription')}
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
