import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { auth } from '../../lib/auth'
import { loadMessages } from '../../lib/i18n'
import { canAccessAdmin } from '../../lib/rbac'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export const Route = createFileRoute('/admin/')({
  loader: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    // Redirect if not authenticated or not admin
    if (!session || !canAccessAdmin(session.user)) {
      throw redirect({ to: '/' })
    }

    const messages = await loadMessages('en')

    // Fetch admin stats server-side
    let userCount = 0
    try {
      const usersResult = await auth.api.listUsers({
        query: {}
      })
      userCount = usersResult?.users?.length || 0
    } catch (error) {
      console.error('[Admin Dashboard] Failed to fetch user count:', error)
    }

    return { session, messages, userCount }
  },
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { messages, userCount } = Route.useLoaderData()

  const t = (namespace: string, key: string) => {
    const keys = `${namespace}.${key}`.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('admin', 'title')}</h1>
          <p className="text-muted-foreground">{t('admin', 'description')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin', 'totalUsers')}</CardTitle>
              <CardDescription>{t('admin', 'registeredUsers')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin', 'systemStatus')}</CardTitle>
              <CardDescription>{t('admin', 'systemHealth')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">✓ {t('admin', 'healthy')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/admin/users">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{t('admin', 'userManagement')}</CardTitle>
                <CardDescription>
                  {t('admin', 'userManagementDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('admin', 'viewAllUsers')}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/organizations">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{t('admin', 'organizationManagement')}</CardTitle>
                <CardDescription>
                  {t('admin', 'organizationManagementDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('admin', 'viewAllOrganizations')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
