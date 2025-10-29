/**
 * Email Templates Index
 * Central export point for all email templates
 */

export { MagicLinkEmail } from './auth/magic-link'
export type { MagicLinkEmailProps } from './auth/magic-link'

export { ResetPasswordEmail } from './auth/reset-password'
export type { ResetPasswordEmailProps } from './auth/reset-password'

export { ConfirmationEmail } from './auth/confirmation'
export type { ConfirmationEmailProps } from './auth/confirmation'

export { InviteEmail } from './auth/invite'
export type { InviteEmailProps } from './auth/invite'

export { ChangeEmailEmail } from './auth/change-email'
export type { ChangeEmailEmailProps } from './auth/change-email'

// Export components for custom email compositions
export { EmailLayout } from './auth/components/EmailLayout'
export type { EmailLayoutProps } from './auth/components/EmailLayout'

export { EmailButton } from './auth/components/EmailButton'
export type { EmailButtonProps } from './auth/components/EmailButton'

export { OtpCode } from './auth/components/OtpCode'
export type { OtpCodeProps } from './auth/components/OtpCode'

// Export styles for customization
export * as emailStyles from './auth/styles'
