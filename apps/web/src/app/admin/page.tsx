import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { canAccessAdmin } from "@/lib/rbac"

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Server-side authentication and authorization check
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Redirect if not authenticated or not admin
  if (!session || !canAccessAdmin(session.user)) {
    redirect('/')
  }

  // Fetch admin stats server-side
  let userCount = 0
  try {
    const usersResult = await auth.api.listUsers({
      query: {}
    })
    userCount = usersResult?.users?.length || 0
  } catch (error) {
    console.error('[Admin Dashboard] Failed to fetch user count:', error)
    // Continue with 0 count on error
  }

  // Use server-side translations API for async server components
  const t = await getTranslations('admin')

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
              <p className="text-3xl font-bold">{userCount}</p>
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
