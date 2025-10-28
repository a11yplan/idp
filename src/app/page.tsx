"use client"


import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"


export const dynamic = 'force-dynamic'
export default function Home() {
  const { session, isLoading } = useAuth()
  const router = useRouter()


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

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Better Auth + Next.js</CardTitle>
            <CardDescription>
              A modern authentication system with Next.js and shadcn/ui
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are not signed in. Please sign in or create an account to continue.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="flex-1">
                <Button className="w-full">Sign in</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button variant="outline" className="w-full">Sign up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin = session.user.role === "admin" || session.user.role === "owner"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Better Auth + Next.js Demo</CardTitle>
            <CardDescription>
              Migrated from Nuxt/Vue to Next.js with shadcn/ui
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Welcome, {session.user.name || session.user.email}!
              </h2>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium mb-2">Session Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{session.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Verified:</span>
                    <Badge variant={session.user.emailVerified ? "default" : "secondary"}>
                      {session.user.emailVerified ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-mono text-xs">{session.user.id}</span>
                  </div>
                  {session.user.role && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <Badge>{session.user.role}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/profile">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center p-4">
                    <div className="flex-1">
                      <p className="font-medium">My Profile</p>
                      <p className="text-xs text-muted-foreground">Edit your profile</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/organizations">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center p-4">
                    <div className="flex-1">
                      <p className="font-medium">Organizations</p>
                      <p className="text-xs text-muted-foreground">Manage your teams</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-purple-200">
                    <CardContent className="flex items-center p-4">
                      <div className="flex-1">
                        <p className="font-medium">Admin Panel</p>
                        <p className="text-xs text-muted-foreground">System management</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              <Link href="/profile/settings">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center p-4">
                    <div className="flex-1">
                      <p className="font-medium">Settings</p>
                      <p className="text-xs text-muted-foreground">Account security</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Email/Password Authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Magic Link Authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>User Profile Management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Organization Management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Member Invitations & Roles</span>
                </li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Admin Panel & User Management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>User Impersonation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>PostgreSQL Database</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Deployed on Vercel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Email Verification & Security</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
