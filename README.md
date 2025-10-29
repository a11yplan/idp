# Better Auth IDP - Turborepo Monorepo

**Identity Provider for a11yplan**

A full-stack authentication system built with [Better Auth](https://www.better-auth.com), [Convex](https://convex.dev), [Next.js 15](https://nextjs.org), organized as a Bun-powered Turborepo monorepo.

## Features

✨ **Authentication Methods**
- Email & Password with verification
- Magic Link (passwordless)
- Session management with cookie caching

🏢 **Multi-tenant Architecture**
- Organization management
- Member invitations with roles
- User impersonation for admin
- Audit trail and activity logging

🌍 **Internationalization**
- Multi-language support (English, German)
- Localized email templates
- UI translations with next-intl

🚀 **Technology Stack**
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Authentication**: Better Auth with Convex adapter
- **Backend**: Convex (realtime database)
- **Email**: Resend with React Email templates
- **Deployment**: Vercel
- **Package Manager**: Bun
- **Monorepo**: Turborepo

## Monorepo Structure

```
ui-better-auth/
├── apps/
│   └── web/                   # Next.js app with Better Auth
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   ├── components/    # React components
│       │   ├── lib/           # Utilities and auth config
│       │   └── contexts/      # React contexts
│       ├── convex/            # Convex backend functions
│       ├── messages/          # i18n translations (en, de)
│       └── package.json
├── packages/
│   └── emails/                # React Email templates (shared)
│       ├── emails/auth/       # Auth email templates
│       └── package.json
├── turbo.json                 # Turborepo configuration
├── vercel.json                # Vercel monorepo config
└── package.json               # Root workspace
```

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Better Auth
BETTER_AUTH_SECRET=your-random-secret-min-32-characters
BETTER_AUTH_URL=http://localhost:3810

# Convex
CONVEX_DEPLOYMENT=your-convex-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Email (Resend)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3810
EMAIL_LOCALE=en  # or 'de' for German
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Setup Convex

```bash
cd apps/web
bunx convex dev
```

This will:
- Create a new Convex project (first time)
- Generate schema and deploy functions
- Start Convex development server

### 4. Start Development Server

From the root directory:

```bash
bun dev
```

Or run just the web app:

```bash
cd apps/web
bun dev
```

Visit [http://localhost:3810](http://localhost:3810)

## Development

### Web App (Next.js)

**Location**: `apps/web/`

**Commands**:
```bash
cd apps/web
bun dev          # Start dev server on port 3810
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
```

### Email Templates Package

Shared React Email templates for authentication flows.

**Location**: `packages/emails/`

**Templates**:
- `magic-link.tsx` - Magic link login with OTP code
- `reset-password.tsx` - Password reset
- `confirmation.tsx` - Email verification
- `invite.tsx` - Organization invitations
- `change-email.tsx` - Email change confirmation

**Commands**:
```bash
bun email:dev        # Preview emails on port 3811
bun email:export     # Export static HTML
```

**Preview URL**: http://localhost:3811

## Turborepo Commands

From the root directory:

```bash
bun dev              # Run all dev servers
bun build            # Build all apps
bun lint             # Lint all apps
bun email:dev        # Preview emails only
bun email:export     # Export email templates
bun clean            # Clean all build artifacts
```

## Authentication Usage

### Client-Side (React Components)

```tsx
"use client"

import { useSession, signIn, signOut } from '@/lib/auth-client'

export function MyComponent() {
  const { data: session, isPending } = useSession()

  if (isPending) return <div>Loading...</div>

  if (!session?.user) {
    return <button onClick={() => signIn.email({
      email: 'user@example.com',
      password: 'password'
    })}>
      Sign In
    </button>
  }

  return (
    <div>
      <p>Welcome, {session.user.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### Server-Side (Server Components)

```tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return <div>Not authenticated</div>
  }

  return <div>Welcome, {session.user.email}</div>
}
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push -u origin main
```

### 2. Import to Vercel

- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your repository
- Vercel will auto-detect the monorepo structure

### 3. Configure Environment Variables

Add these in Vercel dashboard:
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (your Vercel URL)
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (your Vercel URL)
- `EMAIL_LOCALE`

### 4. Deploy

Vercel will automatically deploy using the monorepo configuration in `vercel.json`:
- Installs dependencies at root with `bun install`
- Builds the web app with `cd apps/web && bun run build`
- Outputs to `apps/web/.next`

## Email Configuration

**Resend (Recommended)**:
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add domain and verify
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`

All email templates are automatically used via the `@repo/emails` workspace package.

## Key Features

- ✅ Email/Password Authentication
- ✅ Magic Link Authentication
- ✅ Email Verification
- ✅ Password Reset
- ✅ User Profile Management
- ✅ Organization Management (Multi-tenant)
- ✅ Member Invitations & Roles
- ✅ Admin Panel & User Management
- ✅ User Impersonation
- ✅ Audit Trail & Activity Logging
- ✅ Internationalization (i18n)
- ✅ Session Management
- ✅ Route Protection
- ✅ Turborepo Monorepo
- ✅ Shared Email Templates

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel Deployment](https://vercel.com/docs)

## License

MIT
