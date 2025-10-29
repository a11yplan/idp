import Link from "next/link"
import { useTranslations } from "next-intl"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { canAccessAdmin, getUserDisplayName, isBetterAuthAdmin } from "@/lib/rbac"
import { config } from "@/lib/config"
import { SignOutButton } from "@/components/auth/sign-out-button"

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

  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const tAuth = useTranslations('auth')

  const isAdmin = canAccessAdmin(session.user)
  const isBetterAdmin = isBetterAuthAdmin(session.user)
  const displayName = getUserDisplayName(session.user)

  // Simplified view for non-admin users
  if (!isBetterAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
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

            {/* Logout Button */}
            <SignOutButton className="w-full" variant="outline">
              {tCommon('signOut')}
            </SignOutButton>
          </CardContent>
        </Card>
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
              {session.user.role && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{tCommon('role')}</span>
                  <Badge>{session.user.role}</Badge>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
