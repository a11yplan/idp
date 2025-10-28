# Better Auth + Next.js

A full-stack authentication system built with [Better Auth](https://www.better-auth.com), [Next.js](https://nextjs.org), and [PostgreSQL](https://www.postgresql.org/), designed for deployment on [Vercel](https://vercel.com).

## Features

✨ **Authentication Methods**
- Email & Password with verification
- Magic Link (passwordless)
- Session management with cookie caching

🚀 **Technology Stack**
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Backend**: Better Auth with Next.js Route Handlers
- **Database**: PostgreSQL (Vercel Postgres, Neon, or any PostgreSQL)
- **Email**: Resend
- **Deployment**: Vercel
- **Package Manager**: Bun

🔒 **Security Features**
- Email verification
- Password reset flow
- Rate limiting
- Secure session cookies
- HTTPS by default

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
BETTER_AUTH_SECRET=your-random-secret-min-32-characters
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/database
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Setup Database

Run Better Auth migrations:

```bash
bunx @better-auth/cli migrate
```

### 4. Start Development Server

```bash
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nextjs/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── profile/
│   │   │   ├── organizations/
│   │   │   └── admin/
│   │   ├── api/
│   │   │   └── auth/[...all]/route.ts  # Better Auth API
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── forms/           # Form components
│   │   └── providers/       # React providers
│   ├── lib/
│   │   ├── auth.ts          # Better Auth server config
│   │   ├── auth-client.ts   # Better Auth React client
│   │   ├── email.ts         # Email utilities
│   │   └── utils.ts
│   └── middleware.ts        # Route protection
├── .env.local
├── components.json          # shadcn/ui config
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Available Scripts

```bash
# Development
bun dev              # Start dev server

# Production
bun build            # Build for production
bun start            # Start production server

# Database
bunx @better-auth/cli migrate  # Run database migrations

# Linting
bun lint             # Run ESLint
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

### Server-Side (Server Components & Route Handlers)

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

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   Add these in Vercel dashboard:
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (your Vercel URL)
   - `DATABASE_URL` (Vercel Postgres or Neon)
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)

4. **Setup Database**
   - Use Vercel Postgres (recommended) or Neon
   - Run migrations: `bunx @better-auth/cli migrate`

5. **Deploy**
   Vercel will automatically deploy on push to main

## Database Options

### Vercel Postgres (Recommended)
```bash
# In Vercel dashboard: Storage → Postgres → Create
# Copy DATABASE_URL to environment variables
```

### Neon (Serverless Postgres)
```bash
# Sign up at neon.tech
# Create project and get connection string
# Add to DATABASE_URL
```

### Any PostgreSQL
```bash
# Use any PostgreSQL provider
# Just set DATABASE_URL environment variable
```

## Email Configuration

Better Auth requires email sending for verification and password reset.

**Resend (Recommended)**:
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add domain and verify
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`

## Features

- ✅ Email/Password Authentication
- ✅ Magic Link Authentication
- ✅ Email Verification
- ✅ Password Reset
- ✅ User Profile Management
- ✅ Organization Management
- ✅ Member Invitations & Roles
- ✅ Admin Panel & User Management
- ✅ User Impersonation
- ✅ Session Management
- ✅ Route Protection
- ✅ shadcn/ui Components

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel Deployment](https://vercel.com/docs)

## License

MIT
