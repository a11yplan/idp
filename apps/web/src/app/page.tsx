import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { canAccessAdmin, getUserDisplayName, isBetterAuthAdmin } from "@/lib/rbac"
import { config } from "@/lib/config"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { AppLogo } from "@/components/ui/app-logo"

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Server-side session validation (secure)
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Redirect to login if not authenticated
  // This provides secure server-side validation in addition to middleware check
  if (!session) {
    redirect('/login')
  }

  // Use server-side translations API for async server components
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')
  const tAuth = await getTranslations('auth')

  const isAdmin = canAccessAdmin(session.user)
  const isBetterAdmin = isBetterAuthAdmin(session.user)
  const displayName = getUserDisplayName(session.user)

  // Simplified view for non-admin users
  if (!isBetterAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* App Logo - Consistent with login/signup pages */}
          <div className="flex justify-center">
            <AppLogo size="md" />
          </div>

          {/* Content Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {t('welcomeBack', { name: displayName })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            {/* User Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm text-muted-foreground">{tCommon('email')}</span>
                <span className="text-sm font-medium">{session.user.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{tAuth('emailVerified')}</span>
                <Badge variant={session.user.emailVerified ? "default" : "secondary"}>
                  {session.user.emailVerified ? tAuth('verified') : tAuth('notVerified')}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {config.appUrl && (
                <Link href={config.appUrl} className="block">
                  <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    {t('goToApp')}
                  </button>
                </Link>
              )}
              <SignOutButton className="w-full" variant="outline">
                {tCommon('signOut')}
              </SignOutButton>
            </div>
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
              {t('welcomeBack', { name: displayName })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Status */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{tCommon('email')}</span>
                <span className="text-sm font-medium">{session.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{tAuth('emailVerified')}</span>
                <Badge variant={session.user.emailVerified ? "default" : "secondary"}>
                  {session.user.emailVerified ? tAuth('verified') : tAuth('notVerified')}
                </Badge>
              </div>
              {(session.user as any).role && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{tCommon('role')}</span>
                  <Badge>{(session.user as any).role}</Badge>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                {t('quickActions')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/profile">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center p-4">
                      <div className="flex-1">
                        <p className="font-medium">{t('myProfile')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('myProfileDescription')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {config.features.organizations && (
                  <Link href="/organizations">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="flex items-center p-4">
                        <div className="flex-1">
                          <p className="font-medium">{t('organizations')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('organizationsDescription')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                {config.features.adminPanel && isAdmin && (
                  <Link href="/admin">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-purple-200">
                      <CardContent className="flex items-center p-4">
                        <div className="flex-1">
                          <p className="font-medium">{t('adminPanel')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('adminPanelDescription')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                <Link href="/profile/settings">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center p-4">
                      <div className="flex-1">
                        <p className="font-medium">{t('settings')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('settingsDescription')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Go to App Button */}
            {config.appUrl && (
              <div className="pt-4 border-t">
                <Link href={config.appUrl} className="block">
                  <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    {t('goToApp')}
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
