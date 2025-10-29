import { useEffect, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { auth } from '../../lib/auth'
import { loadMessages } from '../../lib/i18n'
import { authClient } from '../../lib/auth-client'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'

interface Organization {
  id: string
  name: string
  slug: string
  metadata?: any
  createdAt: Date
  role: string
  memberCount?: number
}

export const Route = createFileRoute('/organizations/')({
  loader: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw redirect({ to: '/login' })
    const messages = await loadMessages('en')
    return { session, messages }
  },
  component: OrganizationsPage,
})

function OrganizationsPage() {
  const { messages } = Route.useLoaderData()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  const t = (namespace: string, key: string) => {
    const keys = `${namespace}.${key}`.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const result = await authClient.organization.list()
        if (result.data) {
          setOrganizations(result.data as any)
        }
      } catch (error) {
        // Error handled silently - user will see empty state
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('organizations', 'title')}</h1>
            <p className="text-muted-foreground">{t('organizations', 'myOrganizations')}</p>
          </div>
          <Link to="/organizations/create">
            <Button>{t('organizations', 'create')}</Button>
          </Link>
        </div>

        {organizations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold">{t('organizations', 'noOrganizations')}</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t('organizations', 'createDescription')}
                </p>
                <Link to="/organizations/create">
                  <Button>{t('organizations', 'create')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Link key={org.id} to={`/organizations/${org.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription>@{org.slug}</CardDescription>
                      </div>
                      <Badge variant={getRoleBadgeVariant(org.role)}>
                        {t('organizations', org.role as 'owner' | 'admin' | 'member')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {org.memberCount !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('organizations', 'members')}</span>
                          <span className="font-medium">{org.memberCount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('organizations', 'created')}</span>
                        <span className="font-medium">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
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
