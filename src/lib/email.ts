import { Resend } from 'resend'
import {
  createVerificationEmail,
  createMagicLinkEmail,
  createPasswordResetEmail,
  createOrganizationInvitationEmail,
} from './email-templates'

/**
 * Email Service
 * Handles all email sending via Resend API
 */

/**
 * Get Resend client instance
 * Returns null if API key is not configured
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured. Email sending will be disabled.')
    return null
  }

  return new Resend(apiKey)
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(params: {
  email: string
  url: string
  token: string
}): Promise<{ success: boolean; error?: string }> {
  const { email, url } = params
  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@example.com'

  // Development mode fallback
  if (!resend) {
    console.log('📧 Email Verification (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Verification URL: ${url}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailContent = createVerificationEmail({
      url,
      appName: 'Better Auth',
    })

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (error) {
      console.error('Failed to send verification email:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Verification email sent to ${email}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending verification email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send magic link email
 */
export async function sendMagicLinkEmail(params: {
  email: string
  url: string
  token: string
}): Promise<{ success: boolean; error?: string }> {
  const { email, url } = params
  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@example.com'

  // Development mode fallback
  if (!resend) {
    console.log('📧 Magic Link (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Magic Link URL: ${url}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailContent = createMagicLinkEmail({
      url,
      appName: 'Better Auth',
    })

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (error) {
      console.error('Failed to send magic link email:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Magic link email sent to ${email}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending magic link email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  email: string
  url: string
  token: string
}): Promise<{ success: boolean; error?: string }> {
  const { email, url } = params
  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@example.com'

  // Development mode fallback
  if (!resend) {
    console.log('📧 Password Reset (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Reset URL: ${url}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailContent = createPasswordResetEmail({
      url,
      appName: 'Better Auth',
    })

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (error) {
      console.error('Failed to send password reset email:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Password reset email sent to ${email}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send organization invitation email
 */
export async function sendOrganizationInvitationEmail(params: {
  email: string
  inviterName: string
  organizationName: string
  inviteLink: string
  role?: string
}): Promise<{ success: boolean; error?: string }> {
  const { email, inviterName, organizationName, inviteLink, role = 'member' } = params
  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@example.com'

  // Development mode fallback
  if (!resend) {
    console.log('📧 Organization Invitation (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Organization: ${organizationName}`)
    console.log(`Invited by: ${inviterName}`)
    console.log(`Role: ${role}`)
    console.log(`Invitation URL: ${inviteLink}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailContent = createOrganizationInvitationEmail({
      url: inviteLink,
      organizationName,
      inviterName,
      role,
      appName: 'Better Auth',
    })

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (error) {
      console.error('Failed to send organization invitation email:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Organization invitation email sent to ${email}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending organization invitation email:', error)
    return { success: false, error: error.message }
  }
}
