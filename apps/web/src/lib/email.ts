import { Resend } from 'resend'
import { render } from '@react-email/render'
import {
  MagicLinkEmail,
  OtpEmail,
  ResetPasswordEmail,
  ConfirmationEmail,
  InviteEmail,
  ChangeEmailEmail,
} from '@repo/emails'

/**
 * Email Service
 * Handles all email sending via Resend API with React Email templates
 */

/**
 * Get locale from environment or default to 'en'
 */
function getLocale(): 'en' | 'de' {
  const locale = process.env.EMAIL_LOCALE || 'en'
  return locale === 'de' ? 'de' : 'en'
}

/**
 * Get site URL for email links
 */
function getSiteUrl(): string {
  return process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3810'
}

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
 * Get formatted email sender address
 * Combines EMAIL_FROM and EMAIL_FROM_NAME if both are set
 */
function getFromEmail(): string {
  const email = process.env.EMAIL_FROM || 'noreply@example.com'
  const name = process.env.EMAIL_FROM_NAME

  // If name is provided, format as "Name <email@domain.com>"
  if (name && name.trim()) {
    return `${name} <${email}>`
  }

  return email
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
  const fromEmail = getFromEmail()
  const locale = getLocale()

  // Development mode fallback
  if (!resend) {
    console.log('📧 Email Verification (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Verification URL: ${url}`)
    console.log(`Locale: ${locale}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailHtml = await render(
      ConfirmationEmail({
        locale,
        confirmationUrl: url,
      })
    )

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: locale === 'de' ? 'E-Mail-Adresse bestätigen' : 'Confirm your email address',
      html: emailHtml,
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
  const { email, url, token } = params
  const resend = getResendClient()
  const fromEmail = getFromEmail()
  const locale = getLocale()
  const siteUrl = getSiteUrl()

  // Extract token hash from URL
  const urlObj = new URL(url)
  const tokenHash = urlObj.searchParams.get('token') || token

  // Development mode fallback
  if (!resend) {
    console.log('📧 Magic Link (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Magic Link URL: ${url}`)
    console.log(`Token: ${token}`)
    console.log(`Locale: ${locale}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailHtml = await render(
      MagicLinkEmail({
        locale,
        siteUrl,
        tokenHash,
        token,
      })
    )

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: locale === 'de' ? 'Dein Login-Link' : 'Your login link',
      html: emailHtml,
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
 * Send OTP email
 */
export async function sendOTPEmail(params: {
  email: string
  otp: string
  type: 'sign-in' | 'email-verification' | 'forget-password'
}): Promise<{ success: boolean; error?: string }> {
  const { email, otp, type } = params
  const resend = getResendClient()
  const fromEmail = getFromEmail()
  const locale = getLocale()

  // Development mode fallback
  if (!resend) {
    console.log('📧 OTP Code (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Type: ${type}`)
    console.log(`OTP: ${otp}`)
    console.log(`Locale: ${locale}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailHtml = await render(
      OtpEmail({
        locale,
        otp,
        type,
      })
    )

    const subjectMap = {
      'sign-in': locale === 'de' ? 'Dein Anmelde-Code' : 'Your sign-in code',
      'email-verification': locale === 'de' ? 'E-Mail verifizieren' : 'Verify your email',
      'forget-password': locale === 'de' ? 'Passwort zurücksetzen' : 'Reset your password',
    }

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: subjectMap[type],
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send OTP email:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ OTP email sent to ${email}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending OTP email:', error)
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
  const { email, url, token } = params
  const resend = getResendClient()
  const fromEmail = getFromEmail()
  const locale = getLocale()
  const siteUrl = getSiteUrl()

  // Extract token hash from URL
  const urlObj = new URL(url)
  const tokenHash = urlObj.searchParams.get('token') || token
  const redirectTo = urlObj.searchParams.get('redirect_to') || ''

  // Development mode fallback
  if (!resend) {
    console.log('📧 Password Reset (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Reset URL: ${url}`)
    console.log(`Locale: ${locale}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailHtml = await render(
      ResetPasswordEmail({
        locale,
        siteUrl,
        tokenHash,
        redirectTo,
      })
    )

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: locale === 'de' ? 'Passwort zurücksetzen' : 'Reset your password',
      html: emailHtml,
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
  const { email, organizationName, inviteLink, role = 'member' } = params
  const resend = getResendClient()
  const fromEmail = getFromEmail()
  const locale = getLocale()

  // Development mode fallback
  if (!resend) {
    console.log('📧 Organization Invitation (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Organization: ${organizationName}`)
    console.log(`Role: ${role}`)
    console.log(`Invitation URL: ${inviteLink}`)
    console.log(`Locale: ${locale}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailHtml = await render(
      InviteEmail({
        locale,
        inviteUrl: inviteLink,
        teamName: organizationName,
      })
    )

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject:
        locale === 'de'
          ? `Du wurdest zu ${organizationName} eingeladen`
          : `You've been invited to join ${organizationName}`,
      html: emailHtml,
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

/**
 * Send email change confirmation
 */
export async function sendEmailChangeEmail(params: {
  email: string
  url: string
  token: string
}): Promise<{ success: boolean; error?: string }> {
  const { email, url, token } = params
  const resend = getResendClient()
  const fromEmail = getFromEmail()
  const locale = getLocale()
  const siteUrl = getSiteUrl()

  // Extract token hash from URL
  const urlObj = new URL(url)
  const tokenHash = urlObj.searchParams.get('token') || token
  const redirectTo = urlObj.searchParams.get('redirect_to') || ''

  // Development mode fallback
  if (!resend) {
    console.log('📧 Email Change (Development Mode)')
    console.log(`To: ${email}`)
    console.log(`Change URL: ${url}`)
    console.log(`Locale: ${locale}`)
    console.log('---')
    return { success: true }
  }

  try {
    const emailHtml = await render(
      ChangeEmailEmail({
        locale,
        siteUrl,
        tokenHash,
        redirectTo,
      })
    )

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: locale === 'de' ? 'E-Mail-Änderung bestätigen' : 'Confirm your email change',
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send email change email:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Email change email sent to ${email}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending email change email:', error)
    return { success: false, error: error.message }
  }
}
