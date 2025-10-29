"use client"


import { useState } from "react"
import { useRouter } from "next/navigation"
import { organization } from "@/lib/auth-client"
import { BackButton } from "@/components/navigation/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BetterAuthLogger } from "@/lib/debug-logger"


export const dynamic = 'force-dynamic'
export default function CreateOrganizationPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log('🏢 [Organization Create] Creating organization:', { name, slug, description })

    try {
      const result = await organization.create({
        name,
        slug,
        metadata: description ? { description } : undefined,
      })

      console.log('🏢 [Organization Create] Create result:', result)

      if (result.error) {
        console.error('❌ [Organization Create] Failed to create organization:', result.error)
        BetterAuthLogger.org.error('create', result.error)
        setError(result.error.message || "Failed to create organization")
      } else if (result.data) {
        const orgData = result.data as any

        console.log('✅ [Organization Create] Organization created successfully:', {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          // The role should be included in the response
          role: orgData.role,
        })

        BetterAuthLogger.org.created(
          orgData.id,
          orgData.name,
          orgData.role || 'owner' // Should be 'owner' by default
        )

        // Log a reminder for debugging
        console.log('💡 [Organization Create] Expected role: "owner" (as creator)')
        console.log('💡 [Organization Create] Check server logs for "🎉 [Better Auth] Organization created"')

        router.push(`/organizations/${orgData.id}`)
        router.refresh()
      }
    } catch (err: any) {
      console.error('❌ [Organization Create] Exception during creation:', err)
      BetterAuthLogger.org.error('create', err)
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <BackButton href="/organizations" />

        <div>
          <h1 className="text-3xl font-bold">Create Organization</h1>
          <p className="text-muted-foreground">Set up a new team or workspace</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Enter the information for your new organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  placeholder="acme-corporation"
                  required
                  pattern="[a-z0-9-]+"
                />
                <p className="text-xs text-muted-foreground">
                  This will be used in URLs: /organizations/{slug || "your-slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your organization"
                  rows={3}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
