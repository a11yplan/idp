import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { auth } from '../../lib/auth'
import { loadMessages } from '../../lib/i18n'
import { authClient } from '../../lib/auth-client'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Skeleton } from '../../components/ui/skeleton'
import { getUserInitials } from '../../lib/rbac'

export const Route = createFileRoute('/profile/')({
  loader: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw redirect({ to: '/login' })
    const messages = await loadMessages('en')
    return { session, messages }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { session: loaderSession, messages } = Route.useLoaderData()
  const { data: session, isPending } = authClient.useSession()

  // Translation helper
  const t = (namespace: string, key: string) => {
    const keys = `${namespace}.${key}`.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const user = (session?.user || loaderSession.user) as any
  const initials = getUserInitials(user)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('profile', 'title')}</h1>
          <Link to="/profile/settings">
            <Button>{t('profile', 'editProfile')}</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.name || t('profile', 'noNameSet')}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {t('profile', 'accountInformation')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('profile', 'email')}</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('auth', 'emailVerified')}</span>
                    <Badge variant={user.emailVerified ? "default" : "secondary"}>
                      {user.emailVerified ? t('auth', 'verified') : t('auth', 'notVerified')}
                    </Badge>
                  </div>
                  {user.role && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('profile', 'role')}</span>
                      <Badge>{user.role}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {(user.bio || user.phone) && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {t('profile', 'additionalInformation')}
                  </h3>
                  <div className="space-y-3">
                    {user.bio && (
                      <div>
                        <span className="text-sm text-muted-foreground">{t('profile', 'bio')}</span>
                        <p className="text-sm mt-1">{user.bio}</p>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('profile', 'phone')}</span>
                        <span className="text-sm font-medium">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Link to="/profile/settings">
                <Button className="w-full sm:w-auto">{t('profile', 'editProfile')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
