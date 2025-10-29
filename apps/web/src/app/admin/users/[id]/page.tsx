import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminUserDetailClient } from "@/components/admin/admin-user-detail-client"
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
  image: string | null
}

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  // Server-side authentication and authorization check
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Redirect if not authenticated or not admin
  if (!session || !canAccessAdmin(session.user)) {
    redirect('/')
  }

  const userId = params.id

  // Fetch user details server-side
  let user: User | null = null
  try {
    const result = await auth.api.listUsers()
    const users = result?.users as User[]
    user = users?.find((u) => u.id === userId) || null
  } catch (error) {
    console.error('[Admin User Detail] Failed to fetch user:', error)
  }

  if (!user) {
    redirect('/admin/users')
  }

  return <AdminUserDetailClient user={user} currentUserId={session.user.id} />
}
