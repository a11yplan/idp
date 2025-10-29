"use client"

import { useEffect, useState } from "react"
import { useSession, admin } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { canAccessAdmin } from "@/lib/rbac"

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  const t = useTranslations('admin')
  const { data: session, isPending } = useSession()
  const [stats, setStats] = useState({ users: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersResult = await admin.listUsers({ query: {} })
        setStats({
          users: usersResult.data?.users?.length || 0,
        })
      } catch (error) {
        // Error handled silently - user will see 0 count
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

  const isAdmin = canAccessAdmin(session?.user)

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Alert variant="destructive">
            <AlertDescription>
              {t('noPermission')}
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
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('totalUsers')}</CardTitle>
              <CardDescription>{t('registeredUsers')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.users}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('systemStatus')}</CardTitle>
              <CardDescription>{t('systemHealth')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">✓ {t('healthy')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/admin/users">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{t('userManagement')}</CardTitle>
                <CardDescription>
                  {t('userManagementDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('viewAllUsers')}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/organizations">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{t('organizations')}</CardTitle>
                <CardDescription>
                  {t('organizationsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('viewAllOrganizations')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
