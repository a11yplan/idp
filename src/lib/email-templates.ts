/**
 * Email Templates
 * Professional HTML email templates with responsive design
 */

interface EmailTemplateData {
  url: string
  appName?: string
  brandColor?: string
}

/**
 * Base email layout with consistent styling
 */
function createEmailLayout(content: string, appName = 'Better Auth'): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${appName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .email-logo {
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 1px;
    }
    .email-body {
      padding: 40px 30px;
    }
    .email-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 20px 0;
      color: #1f2937;
    }
    .email-text {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px 0;
      color: #4b5563;
    }
    .email-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 10px 0;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
    }
    .email-link {
      color: #6366f1;
      word-break: break-all;
      text-decoration: none;
    }
    .email-footer {
      padding: 30px;
      text-align: center;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .email-footer-text {
      font-size: 14px;
      color: #6b7280;
      margin: 5px 0;
    }
    .security-notice {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .security-notice-text {
      font-size: 14px;
      color: #92400e;
      margin: 0;
    }
    @media only screen and (max-width: 600px) {
      .email-body {
        padding: 30px 20px;
      }
      .email-title {
        font-size: 20px;
      }
      .email-button {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="email-logo">${appName}</div>
    </div>
    ${content}
    <div class="email-footer">
      <p class="email-footer-text">This email was sent by ${appName}</p>
      <p class="email-footer-text">If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Email Verification Template
 */
export function createVerificationEmail(data: EmailTemplateData): { subject: string; html: string } {
  const { url, appName = 'Better Auth' } = data

  const content = `
    <div class="email-body">
      <h1 class="email-title">Verify your email address</h1>
      <p class="email-text">
        Welcome to ${appName}! To complete your registration and start using your account,
        please verify your email address by clicking the button below.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" class="email-button">Verify Email Address</a>
      </div>
      <p class="email-text">
        Or copy and paste this link into your browser:
      </p>
      <p class="email-text">
        <a href="${url}" class="email-link">${url}</a>
      </p>
      <div class="security-notice">
        <p class="security-notice-text">
          <strong>Security Notice:</strong> This verification link will expire in 24 hours.
          If you didn't create an account with ${appName}, please ignore this email.
        </p>
      </div>
    </div>
  `

  return {
    subject: `Verify your ${appName} email address`,
    html: createEmailLayout(content, appName),
  }
}

/**
 * Magic Link Template
 */
export function createMagicLinkEmail(data: EmailTemplateData): { subject: string; html: string } {
  const { url, appName = 'Better Auth' } = data

  const content = `
    <div class="email-body">
      <h1 class="email-title">Sign in to ${appName}</h1>
      <p class="email-text">
        Click the button below to sign in to your ${appName} account.
        This link will securely log you in without requiring a password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" class="email-button">Sign In to ${appName}</a>
      </div>
      <p class="email-text">
        Or copy and paste this link into your browser:
      </p>
      <p class="email-text">
        <a href="${url}" class="email-link">${url}</a>
      </p>
      <div class="security-notice">
        <p class="security-notice-text">
          <strong>Security Notice:</strong> This magic link will expire in 10 minutes.
          If you didn't request this link, please ignore this email and ensure your account is secure.
        </p>
      </div>
    </div>
  `

  return {
    subject: `Sign in to ${appName}`,
    html: createEmailLayout(content, appName),
  }
}

/**
 * Password Reset Template
 */
export function createPasswordResetEmail(data: EmailTemplateData): { subject: string; html: string } {
  const { url, appName = 'Better Auth' } = data

  const content = `
    <div class="email-body">
      <h1 class="email-title">Reset your password</h1>
      <p class="email-text">
        We received a request to reset the password for your ${appName} account.
        Click the button below to create a new password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" class="email-button">Reset Password</a>
      </div>
      <p class="email-text">
        Or copy and paste this link into your browser:
      </p>
      <p class="email-text">
        <a href="${url}" class="email-link">${url}</a>
      </p>
      <div class="security-notice">
        <p class="security-notice-text">
          <strong>Security Notice:</strong> This password reset link will expire in 1 hour.
          If you didn't request a password reset, please ignore this email and ensure your account is secure.
          Your password will not be changed unless you click the link above and create a new one.
        </p>
      </div>
    </div>
  `

  return {
    subject: `Reset your ${appName} password`,
    html: createEmailLayout(content, appName),
  }
}

/**
 * Organization Invitation Template
 */
interface OrganizationInvitationData {
  url: string
  organizationName: string
  inviterName: string
  role?: string
  appName?: string
}

export function createOrganizationInvitationEmail(
  data: OrganizationInvitationData
): { subject: string; html: string } {
  const { url, organizationName, inviterName, role = 'member', appName = 'Better Auth' } = data

  const content = `
    <div class="email-body">
      <h1 class="email-title">You're invited to join ${organizationName}</h1>
      <p class="email-text">
        <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong>
        on ${appName} as a <strong>${role}</strong>.
      </p>
      <p class="email-text">
        Click the button below to accept the invitation and get started with your team.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" class="email-button">Accept Invitation</a>
      </div>
      <p class="email-text">
        Or copy and paste this link into your browser:
      </p>
      <p class="email-text">
        <a href="${url}" class="email-link">${url}</a>
      </p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="font-size: 14px; color: #4b5563; margin: 5px 0;">
          <strong>Organization:</strong> ${organizationName}
        </p>
        <p style="font-size: 14px; color: #4b5563; margin: 5px 0;">
          <strong>Invited by:</strong> ${inviterName}
        </p>
        <p style="font-size: 14px; color: #4b5563; margin: 5px 0;">
          <strong>Role:</strong> ${role}
        </p>
      </div>
      <div class="security-notice">
        <p class="security-notice-text">
          <strong>Security Notice:</strong> This invitation link will expire in 48 hours.
          If you don't recognize ${organizationName} or ${inviterName}, please ignore this email.
        </p>
      </div>
    </div>
  `

  return {
    subject: `You're invited to join ${organizationName}`,
    html: createEmailLayout(content, appName),
  }
}
