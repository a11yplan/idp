import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { loadMessages } from '../../../lib/i18n'
import { canAccessAdmin } from '../../../lib/rbac'
import { BackButton } from '../../../components/navigation/back-button'
import { AdminUsersTable } from '../../../components/admin/admin-users-table'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: boolean
  banned: boolean
  banReason: string | null
  banExpires: number | null
  createdAt: Date
  updatedAt: Date
}

export const Route = createFileRoute('/admin/users/')({
  loader: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    // Redirect if not authenticated or not admin
    if (!session || !canAccessAdmin(session.user)) {
      throw redirect({ to: '/' })
    }

    const messages = await loadMessages('en')

    // Fetch users server-side
    let users: User[] = []
    try {
      const result = await auth.api.listUsers({
        query: {}
      })
      users = (result?.users as User[]) || []
    } catch (error) {
      console.error('[Admin Users] Failed to fetch users:', error)
    }

    return { session, messages, users }
  },
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const { session, users } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <BackButton href="/admin" />

        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>

        <AdminUsersTable initialUsers={users} currentUserId={session.user.id} />
      </div>
    </div>
  )
}
