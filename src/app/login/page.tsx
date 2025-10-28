"use client"


import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [callbackURL, setCallbackURL] = useState<string | null>(null)

  // Redirect to home if already logged in
  useEffect(() => {
    if (session) {
      router.push("/")
    }
  }, [session, router])

  // Get callback URL from query params (for IdP flow)
  useEffect(() => {
    const callback = searchParams.get('callbackURL')
    if (callback) {
      setCallbackURL(callback)
    }
  }, [searchParams])

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || "Sign in failed")
      } else {
        setSuccess("Signed in successfully!")
        // Redirect to callback URL if present (IdP flow), otherwise go to home
        if (callbackURL) {
          window.location.href = callbackURL
        } else {
          router.push("/")
          router.refresh()
        }
      }
    } catch (e: any) {
      setError(e.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await signIn.magicLink({
        email,
      })

      if (result.error) {
        setError(result.error.message || "Failed to send magic link")
      } else {
        if (callbackURL) {
          setSuccess("Check your email for the magic link! After clicking it, you'll be redirected to your application.")
        } else {
          setSuccess("Check your email for the magic link!")
        }
      }
    } catch (e: any) {
      setError(e.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            {callbackURL
              ? "You'll be redirected to your application after signing in"
              : "Choose your preferred sign in method"
            }
          </CardDescription>
        </CardHeader>
        {callbackURL && (
          <div className="px-6 pb-4">
            <Alert>
              <AlertDescription>
                You're signing in via Identity Provider. After authentication, you'll be redirected back to your application.
              </AlertDescription>
            </Alert>
          </div>
        )}
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-password">Email address</Label>
                  <Input
                    id="email-password"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic">
              <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-magic">Email address</Label>
                  <Input
                    id="email-magic"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email address"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending link..." : "Send magic link"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
