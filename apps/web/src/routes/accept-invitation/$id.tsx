import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { authClient } from '../../lib/auth-client'
import { AuthLayout } from '../../components/layouts/auth-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Skeleton } from '../../components/ui/skeleton'
import { BetterAuthLogger } from '../../lib/debug-logger'

type Status = 'loading' | 'processing' | 'success' | 'error' | 'unauthorized'

export const Route = createFileRoute('/accept-invitation/$id')({
  component: AcceptInvitationPage,
})

function AcceptInvitationPage() {
  const { id: invitationId } = Route.useParams()
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string>('')
  const [organizationId, setOrganizationId] = useState<string>('')
  const [organizationName, setOrganizationName] = useState<string>('')

  useEffect(() => {
    // Wait for session to load
    if (isPending) return

    // Check if user is logged in
    if (!session?.user) {
      console.log('⚠️ [Accept Invitation] User not logged in, redirecting to login')
      setStatus('unauthorized')
      return
    }

    // User is logged in, proceed with accepting invitation
    acceptInvitation()
  }, [session, isPending, invitationId])

  const acceptInvitation = async () => {
    console.log('📧 [Accept Invitation] Processing invitation:', invitationId)
    setStatus('processing')

    try {
      // First, get invitation details to show organization name
      const invitationResult = await authClient.organization.getInvitation({
        query: {
          id: invitationId,
        },
      })

      console.log('📧 [Accept Invitation] Invitation details:', invitationResult)

      if (invitationResult.data) {
        const invitation = invitationResult.data as any
        setOrganizationName(invitation.organization?.name || 'Unknown Organization')
        setOrganizationId(invitation.organizationId)
      }

      // Accept the invitation
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      })

      console.log('📧 [Accept Invitation] Accept result:', result)

      if (result.error) {
        console.error('❌ [Accept Invitation] Failed:', result.error)
        BetterAuthLogger.invitations.error('accept', result.error)

        // Handle specific error cases
        const errorMessage = result.error.message || 'Failed to accept invitation'
        if (errorMessage.includes('expired')) {
          setError('This invitation has expired. Please contact the organization administrator for a new invitation.')
        } else if (errorMessage.includes('not found')) {
          setError('This invitation is invalid or has already been used.')
        } else if (errorMessage.includes('already a member')) {
          setError('You are already a member of this organization.')
        } else {
          setError(errorMessage)
        }

        setStatus('error')
      } else {
        console.log('✅ [Accept Invitation] Invitation accepted successfully')
        BetterAuthLogger.invitations.accepted(invitationId, organizationName)
        setStatus('success')
      }
    } catch (err: any) {
      console.error('❌ [Accept Invitation] Exception:', err)
      BetterAuthLogger.invitations.error('accept', err)
      setError(err.message || 'An unexpected error occurred')
      setStatus('error')
    }
  }

  const handleRetry = () => {
    setStatus('loading')
    setError('')
    acceptInvitation()
  }

  const handleLogin = () => {
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(`/accept-invitation/${invitationId}`)
    navigate({ to: `/login?returnUrl=${returnUrl}` })
  }

  const handleRegister = () => {
    // Redirect to registration with return URL
    const returnUrl = encodeURIComponent(`/accept-invitation/${invitationId}`)
    navigate({ to: `/signup?returnUrl=${returnUrl}` })
  }

  const handleNavigateToOrg = () => {
    if (organizationId) {
      navigate({ to: `/organizations/${organizationId}` })
    } else {
      navigate({ to: '/organizations' })
    }
  }

  // Loading state while checking session
  if (isPending || status === 'loading') {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Checking your invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  // Not logged in
  if (status === 'unauthorized') {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Welcome! 👋</CardTitle>
            <CardDescription>
              Sign in or create an account to accept this invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You&apos;ve been invited to join an organization. Please sign in or create a new account to continue.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button onClick={handleLogin} className="w-full">
                Sign In
              </Button>
              <Button onClick={handleRegister} variant="outline" className="w-full">
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  // Processing
  if (status === 'processing') {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Accepting Invitation...</CardTitle>
            {organizationName && (
              <CardDescription>Joining {organizationName}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we process your invitation...
            </p>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  // Success
  if (status === 'success') {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Invitation Accepted!
            </CardTitle>
            {organizationName && (
              <CardDescription>Welcome to {organizationName}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You have successfully joined the organization. You can now access shared resources, collaborate with team members, and manage organization settings.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button onClick={handleNavigateToOrg} className="w-full">
                {organizationName ? `Go to ${organizationName}` : 'Go to Organization'}
              </Button>
              <Button
                onClick={() => navigate({ to: '/organizations' })}
                variant="outline"
                className="w-full"
              >
                View All Organizations
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  // Error
  return (
    <AuthLayout>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">❌</span>
            Unable to Accept Invitation
          </CardTitle>
          <CardDescription>There was a problem with your invitation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Troubleshooting tips:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check if the invitation link is correct and complete</li>
              <li>Invitations may expire after a certain period</li>
              <li>You may have already accepted this invitation</li>
              <li>Contact the organization administrator for help</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              Try Again
            </Button>
            <Button onClick={() => navigate({ to: '/invitations' })} className="flex-1">
              View My Invitations
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
