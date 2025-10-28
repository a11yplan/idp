"use client"


import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"


export const dynamic = 'force-dynamic'
export default function ProfilePage() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  // Cast to any to access additional fields (avatar, bio, phone) defined in auth config
  const user = session.user as any
  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Link href="/profile/settings">
            <Button>Edit Profile</Button>
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
                <CardTitle>{user.name || 'No name set'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email Verified</span>
                    <Badge variant={user.emailVerified ? "default" : "secondary"}>
                      {user.emailVerified ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                  {user.role && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Role</span>
                      <Badge>{user.role}</Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">User ID</span>
                    <span className="text-xs font-mono text-muted-foreground">{user.id}</span>
                  </div>
                </div>
              </div>

              {(user.bio || user.phone) && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Additional Information
                  </h3>
                  <div className="space-y-3">
                    {user.bio && (
                      <div>
                        <span className="text-sm text-muted-foreground">Bio</span>
                        <p className="text-sm mt-1">{user.bio}</p>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Phone</span>
                        <span className="text-sm font-medium">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Link href="/profile/settings">
                <Button className="w-full sm:w-auto">Edit Profile & Settings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
