import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '../../../../lib/auth'
import { loadMessages } from '../../../../lib/i18n'
import { canAccessAdmin } from '../../../../lib/rbac'
import { BackButton } from '../../../../components/navigation/back-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'

export const Route = createFileRoute('/admin/users/$id/')({
  loader: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    // Redirect if not authenticated or not admin
    if (!session || !canAccessAdmin(session.user)) {
      throw redirect({ to: '/' })
    }

    const messages = await loadMessages('en')
    return { session, messages, userId: params.id }
  },
  component: AdminUserDetailPage,
})

function AdminUserDetailPage() {
  const { userId } = Route.useLoaderData()

  // TODO: Fetch user details from Better Auth or custom API
  // Better Auth's admin plugin may not have a single user detail endpoint
  // You can create a custom API endpoint to fetch user details

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <BackButton href="/admin/users" />

        <div>
          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground">User ID: {userId}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              View and manage user details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Copy full implementation from src/app/admin/users/[id]/page.tsx if it exists,
              or implement user detail fetching and display here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
