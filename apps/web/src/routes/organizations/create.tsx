import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { auth } from '../../lib/auth'
import { loadMessages } from '../../lib/i18n'
import { authClient } from '../../lib/auth-client'
import { BackButton } from '../../components/navigation/back-button'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'

export const Route = createFileRoute('/organizations/create')({
  loader: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw redirect({ to: '/login' })
    const messages = await loadMessages('en')
    return { session, messages }
  },
  component: CreateOrganizationPage,
})

function CreateOrganizationPage() {
  const { messages } = Route.useLoaderData()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const t = (namespace: string, key: string) => {
    const keys = `${namespace}.${key}`.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

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
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await authClient.organization.create({
        name,
        slug,
        metadata: description ? { description } : undefined,
      })

      if (result.error) {
        setError(result.error.message || t('common', 'error'))
      } else if (result.data) {
        const orgData = result.data as any
        navigate({ to: `/organizations/${orgData.id}` })
      }
    } catch (err: any) {
      setError(err.message || t('common', 'error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <BackButton href="/organizations" />

        <div>
          <h1 className="text-3xl font-bold">{t('organizations', 'create')}</h1>
          <p className="text-muted-foreground">{t('organizations', 'createDescription')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('organizations', 'organizationName')}</CardTitle>
            <CardDescription>
              {t('organizations', 'createDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('organizations', 'organizationName')} *</Label>
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
                  This will be used in URLs: /organizations/{slug || 'your-slug'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('organizations', 'organizationDescription')}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('organizations', 'organizationDescription')}
                  rows={3}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? t('common', 'loading') : t('organizations', 'create')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
