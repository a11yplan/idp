"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { signOut, useSession } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessAdmin, getUserDisplayName, isBetterAuthAdmin } from "@/lib/rbac"
import { config } from "@/lib/config"

export const dynamic = 'force-dynamic'

export default function Home() {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const tAuth = useTranslations('auth')
  const { data: session, isPending: isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-3xl space-y-4 p-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // User should be redirected to login by middleware if not authenticated
  if (!session?.user) {
    return null
  }

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
            <Button
              onClick={() => signOut()}
              className="w-full"
              variant="outline"
            >
              {tCommon('signOut')}
            </Button>
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
