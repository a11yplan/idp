import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { BackButton } from "@/components/navigation/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { canAccessAdmin } from "@/lib/rbac"

export const dynamic = 'force-dynamic'

export default async function AdminOrganizationsPage() {
  // Server-side authentication and authorization check
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Redirect if not authenticated or not admin
  if (!session || !canAccessAdmin(session.user)) {
    redirect('/')
  }

  // Note: Better Auth doesn't provide a listOrganizations admin API yet
  // In a production app, you would create a custom API endpoint to fetch all organizations
  // For now, we show a placeholder message

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <BackButton href="/admin" />

        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">
            Manage organizations across the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Organizations</CardTitle>
            <CardDescription>
              View and manage organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Organization management requires a custom API endpoint to list all organizations.
                Better Auth&apos;s admin plugin doesn&apos;t currently provide this functionality out of the box.
                You can create a custom API route to fetch organizations from the database.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
