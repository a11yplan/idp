import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { auth } from '../lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { canAccessAdmin, getUserDisplayName, isBetterAuthAdmin } from '../lib/rbac'
import { config } from '../lib/config'
import { SignOutButton } from '../components/auth/sign-out-button'
import { AppLogo } from '../components/ui/app-logo'
import { loadMessages } from '../lib/i18n'

/**
 * Homepage Route
 *
 * Displays user dashboard with quick actions.
 * Requires authentication (enforced by authMiddleware).
 */
export const Route = createFileRoute('/')({
  loader: async ({ request }) => {
    // Server-side session validation (secure)
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // Redirect to login if not authenticated
    if (!session) {
      throw redirect({ to: '/login' })
    }

    // Load translations
    const messages = await loadMessages('en')

    return {
      session,
      messages,
    }
  },
  component: HomePage,
})

function HomePage() {
  const { session, messages } = Route.useLoaderData()

  // Translation helper (simplified - just access nested keys)
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  const isAdmin = canAccessAdmin(session.user)
  const isBetterAdmin = isBetterAuthAdmin(session.user)
  const displayName = getUserDisplayName(session.user)

  // Simplified view for non-admin users
  if (!isBetterAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <AppLogo size="md" />
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {t('home.welcomeBack')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-sm text-muted-foreground">{t('common.email')}</span>
                  <span className="text-sm font-medium">{session.user.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('auth.emailVerified')}</span>
                  <Badge variant={session.user.emailVerified ? 'default' : 'secondary'}>
                    {session.user.emailVerified ? t('auth.verified') : t('auth.notVerified')}
                  </Badge>
                </div>
              </div>

              <SignOutButton className="w-full" variant="outline">
                {t('common.signOut')}
              </SignOutButton>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Full dashboard for admin users
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('home.welcomeBack')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('common.email')}</span>
                <span className="text-sm font-medium">{session.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('auth.emailVerified')}</span>
                <Badge variant={session.user.emailVerified ? 'default' : 'secondary'}>
                  {session.user.emailVerified ? t('auth.verified') : t('auth.notVerified')}
                </Badge>
              </div>
              {(session.user as any).role && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('common.role')}</span>
                  <Badge>{(session.user as any).role}</Badge>
                </div>
              )}
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                {t('home.quickActions')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/profile">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center p-4">
                      <div className="flex-1">
                        <p className="font-medium">{t('home.myProfile')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('home.myProfileDescription')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {config.features.organizations && (
                  <Link to="/organizations">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="flex items-center p-4">
                        <div className="flex-1">
                          <p className="font-medium">{t('home.organizations')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('home.organizationsDescription')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                {config.features.adminPanel && isAdmin && (
                  <Link to="/admin">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-purple-200">
                      <CardContent className="flex items-center p-4">
                        <div className="flex-1">
                          <p className="font-medium">{t('home.adminPanel')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('home.adminPanelDescription')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                <Link to="/profile/settings">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center p-4">
                      <div className="flex-1">
                        <p className="font-medium">{t('home.settings')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('home.settingsDescription')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
