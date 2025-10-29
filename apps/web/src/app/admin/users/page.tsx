import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { BackButton } from "@/components/navigation/back-button"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { canAccessAdmin } from "@/lib/rbac"

export const dynamic = 'force-dynamic'

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

export default async function AdminUsersPage() {
  // Server-side authentication and authorization check
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Redirect if not authenticated or not admin
  if (!session || !canAccessAdmin(session.user)) {
    redirect('/')
  }

  // Fetch users server-side
  let users: User[] = []
  try {
    const result = await auth.api.listUsers({
      query: {}
    })
    users = (result?.users as User[]) || []
  } catch (error) {
    console.error('[Admin Users] Failed to fetch users:', error)
    // Continue with empty list on error
  }

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
