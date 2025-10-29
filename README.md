# UI Better Auth - Bun Turborepo

A Bun-based Turborepo monorepo for Better Auth with React Email templates.

## Structure

```
ui-better-auth/
├── apps/
│   └── web/                   # Next.js app with Better Auth
├── packages/
│   └── emails/                # React Email templates (shared)
├── nuxt/                      # Nuxt demo (standalone)
├── nuxt-client-demo/          # Nuxt client demo (standalone)
├── turbo.json                 # Turborepo configuration
└── package.json               # Root workspace configuration
```

## Quick Start

```bash
# Install dependencies
bun install

# Run all apps in development mode
bun dev

# Run web app only
cd apps/web
bun dev

# Preview email templates
bun email:dev
```

## Development

### Web App (Next.js)

The main application with Better Auth integration.

**Location**: `apps/web/`

**Features**:
- Better Auth with PostgreSQL
- Email/Password authentication
- Magic Link authentication
- Organization management
- Multi-language email support (en/de)

**Environment Variables**:
```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3810
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@example.com
EMAIL_LOCALE=en  # or 'de' for German
```

**Commands**:
```bash
cd apps/web
bun dev          # Start dev server on port 3810
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
```

### Email Templates Package

Shared React Email templates for all authentication flows.

**Location**: `packages/emails/`

**Templates**:
- `magic-link.tsx` - Magic link login with OTP code
- `reset-password.tsx` - Password reset
- `confirmation.tsx` - Email verification
- `invite.tsx` - Organization invitations
- `change-email.tsx` - Email change confirmation

**Components**:
- `EmailLayout` - Consistent email layout with header/footer
- `EmailButton` - Styled CTA button
- `OtpCode` - Formatted OTP code display

**Languages**: English (en), German (de)

**Commands**:
```bash
cd packages/emails
bun dev          # Preview emails on port 3811
bun export       # Export static HTML emails
```

**Preview URL**: http://localhost:3811

## Email Integration

### Using Email Templates

All email templates are automatically used by Better Auth through the `@repo/emails` package:

```typescript
import { MagicLinkEmail, ResetPasswordEmail } from '@repo/emails'
import { render } from '@react-email/render'

// Render email to HTML
const emailHtml = await render(
  MagicLinkEmail({
    locale: 'en',  // or 'de'
    siteUrl: 'https://example.com',
    tokenHash: 'abc123',
    token: 'SPARO-NDIGO-AMURT-SECAN',
  })
)
```

### Locale Configuration

Set the email locale via environment variable:
```env
EMAIL_LOCALE=en  # English (default)
# or
EMAIL_LOCALE=de  # German
```

### Customizing Templates

1. Edit templates in `packages/emails/emails/auth/`
2. Update styles in `packages/emails/emails/auth/styles.ts`
3. Changes are reflected immediately in preview and Next.js app

## Turborepo Commands

From the root directory:

```bash
# Run dev servers for all apps
bun dev

# Build all apps
bun build

# Lint all apps
bun lint

# Preview emails only
bun email:dev

# Export email templates
bun email:export

# Clean all build artifacts
bun clean
```

## Technology Stack

### Apps
- **Next.js 15** - React framework with App Router
- **Better Auth** - Authentication system
- **PostgreSQL** - Database (via pg)
- **Resend** - Email delivery service
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components

### Packages
- **React Email** - Email template framework
- **@react-email/components** - Email components
- **React 19** - React library

### Tooling
- **Bun** - Fast JavaScript runtime & package manager
- **Turborepo** - Monorepo build system
- **TypeScript** - Type safety
- **ESLint** - Code linting

## Better Auth Configuration

Better Auth is configured in `apps/web/src/lib/auth.ts` with:

- Email/Password authentication
- Email verification
- Magic Link authentication
- Password reset
- Organization management
- Multi-language email support

All email callbacks automatically use the React Email templates.

## Package Workspace

This monorepo uses Bun workspaces. The emails package is referenced as `@repo/emails` in the web app:

```json
{
  "dependencies": {
    "@repo/emails": "workspace:*"
  }
}
```

## Adding New Email Templates

1. Create template in `packages/emails/emails/auth/`:
```tsx
// my-email.tsx
import { EmailLayout } from './components/EmailLayout'

export interface MyEmailProps {
  locale: 'en' | 'de'
  customProp: string
}

export const MyEmail = ({ locale, customProp }: MyEmailProps) => {
  return (
    <EmailLayout previewText="My Email" locale={locale}>
      {/* Your email content */}
    </EmailLayout>
  )
}

export default MyEmail
```

2. Export from `packages/emails/emails/index.ts`:
```typescript
export { MyEmail } from './auth/my-email'
export type { MyEmailProps } from './auth/my-email'
```

3. Add export to `packages/emails/package.json`:
```json
{
  "exports": {
    "./auth/my-email": "./emails/auth/my-email.tsx"
  }
}
```

4. Use in `apps/web/src/lib/email.ts`:
```typescript
import { MyEmail } from '@repo/emails'

const emailHtml = await render(
  MyEmail({ locale: 'en', customProp: 'value' })
)
```

## Troubleshooting

### Emails not rendering
- Check `@repo/emails` is installed: `bun install`
- Verify imports in `apps/web/src/lib/email.ts`
- Check email preview at http://localhost:3811

### TypeScript errors
- Ensure all packages are built: `bun build`
- Restart TypeScript server in your editor

### Database connection issues
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check Better Auth database tables exist

## License

MIT
