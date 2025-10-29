# TanStack Start Migration Guide

## Migration Progress

### ✅ Completed
- **Phase 1**: Foundation (Vite, Vinxi, entry points, root route)
- **Phase 2**: Custom i18n system (replaces next-intl)
- **Phase 3**: Middleware (auth, CORS, i18n)
- **Phase 4**: Better Auth integration
- **Phase 6**: API routes (Better Auth, IdP endpoints)

### 🔄 In Progress
- **Phase 5**: Convert page routes (21 total)
- **Phase 7**: Theme system
- **Phase 8**: Components & layout

### 📝 Remaining Pages to Convert

```
src/app/accept-invitation/[id]/page.tsx → src/routes/accept-invitation/$id.tsx
src/app/admin/organizations/page.tsx → src/routes/admin/organizations/index.tsx
src/app/admin/page.tsx → src/routes/admin/index.tsx
src/app/admin/users/[id]/page.tsx → src/routes/admin/users/$id/index.tsx
src/app/admin/users/page.tsx → src/routes/admin/users/index.tsx
src/app/billing/page.tsx → src/routes/billing/index.tsx
src/app/invitations/page.tsx → src/routes/invitations/index.tsx
src/app/login/page.tsx → src/routes/login.tsx
src/app/organizations/[id]/members/page.tsx → src/routes/organizations/$id/members/index.tsx
src/app/organizations/[id]/page.tsx → src/routes/organizations/$id/index.tsx
src/app/organizations/[id]/settings/page.tsx → src/routes/organizations/$id/settings/index.tsx
src/app/organizations/[id]/teams/[teamId]/page.tsx → src/routes/organizations/$id/teams/$teamId/index.tsx
src/app/organizations/[id]/teams/[teamId]/settings/page.tsx → src/routes/organizations/$id/teams/$teamId/settings/index.tsx
src/app/organizations/[id]/teams/page.tsx → src/routes/organizations/$id/teams/index.tsx
src/app/organizations/create/page.tsx → src/routes/organizations/create.tsx
src/app/organizations/page.tsx → src/routes/organizations/index.tsx
src/app/pricing/page.tsx → src/routes/pricing/index.tsx
src/app/profile/page.tsx → src/routes/profile/index.tsx
src/app/profile/settings/page.tsx → src/routes/profile/settings/index.tsx
src/app/signup/page.tsx → src/routes/signup.tsx
```

## Conversion Pattern

### Basic Route Structure

```tsx
// Before (Next.js)
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'

export default async function PageName() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const t = await getTranslations('namespace')

  return <div>Content</div>
}

// After (TanStack Start)
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/auth'
import { loadMessages } from '@/lib/i18n'

export const Route = createFileRoute('/route-path')({
  loader: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    const messages = await loadMessages('en')

    return { session, messages }
  },
  component: PageNameComponent,
})

function PageNameComponent() {
  const { session, messages } = Route.useLoaderData()

  // Translation helper
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return <div>Content</div>
}
```

### Key Changes

#### 1. Imports
```tsx
// ❌ Remove Next.js imports
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ✅ Replace with TanStack imports
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { loadMessages } from '@/lib/i18n'
```

#### 2. Route Structure
```tsx
// ❌ Next.js: Default export function
export default async function Page() { }

// ✅ TanStack: Named export with createFileRoute
export const Route = createFileRoute('/path')({
  loader: async ({ request }) => { },
  component: ComponentName,
})
```

#### 3. Dynamic Routes
```tsx
// Next.js: [id]/page.tsx
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id
}

// TanStack: $id/index.tsx or $id.tsx
export const Route = createFileRoute('/path/$id')({
  loader: async ({ params }) => {
    const id = params.id
    return { id }
  },
  component: PageComponent,
})

function PageComponent() {
  const { id } = Route.useLoaderData()
}
```

#### 4. Redirects
```tsx
// ❌ Next.js
import { redirect } from 'next/navigation'
redirect('/login')

// ✅ TanStack
import { redirect } from '@tanstack/react-router'
throw redirect({ to: '/login' })
```

#### 5. Search Params
```tsx
// Next.js
export default async function Page({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q
}

// TanStack
export const Route = createFileRoute('/path')({
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  loader: async ({ search }) => {
    const query = search.q
    return { query }
  },
  component: PageComponent,
})
```

#### 6. Session & Auth
```tsx
// Server-side session check (same in both)
const session = await auth.api.getSession({
  headers: request.headers // TanStack
  // headers: await headers() // Next.js
})

// Redirect if not authenticated
if (!session) {
  throw redirect({ to: '/login' }) // TanStack
  // redirect('/login') // Next.js
}
```

#### 7. Translations
```tsx
// Next.js
const t = await getTranslations('namespace')
const text = t('key')

// TanStack
const messages = await loadMessages('en') // in loader
const t = (key: string) => { // in component
  const keys = key.split('.')
  let value: any = messages
  for (const k of keys) value = value?.[k]
  return value || key
}
const text = t('namespace.key')
```

#### 8. Navigation Links
```tsx
// ❌ Next.js
import Link from 'next/link'
<Link href="/path">Text</Link>

// ✅ TanStack
import { Link } from '@tanstack/react-router'
<Link to="/path">Text</Link>
```

## Component Updates Needed

### Remove "use client" Directives
TanStack Start automatically handles client/server boundaries. Remove all `"use client"` directives from component files.

### Update Navigation Components
All components using `next/link` need to import Link from `@tanstack/react-router` instead.

### Update useRouter Usage
```tsx
// ❌ Next.js
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/path')

// ✅ TanStack
import { useNavigate } from '@tanstack/react-router'
const navigate = useNavigate()
navigate({ to: '/path' })
```

### Update Auth Client
The auth client (`src/lib/auth-client.ts`) remains mostly the same, but remove window checks:

```tsx
// ❌ Before
baseURL: typeof window !== 'undefined'
  ? window.location.origin
  : process.env.NEXT_PUBLIC_BETTER_AUTH_URL

// ✅ After
baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3810'
```

## Testing Checklist

After converting each route:

- [ ] Route loads without errors
- [ ] SSR works (view page source shows rendered HTML)
- [ ] Auth redirects work correctly
- [ ] Dynamic params work
- [ ] Search params work
- [ ] Links navigate correctly
- [ ] Translations load properly
- [ ] Forms submit correctly
- [ ] Session validation works

## Environment Variables

### Update .env files
```bash
# ❌ Remove NEXT_PUBLIC_ prefix
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3810
NEXT_PUBLIC_APP_URL=http://localhost:3810

# ✅ TanStack uses different environment variable system
BETTER_AUTH_URL=http://localhost:3810
APP_URL=http://localhost:3810
```

Note: Vinxi/Vite have different environment variable handling. Variables are available via `process.env` in server code and via `import.meta.env` in client code.

## Theme System

Create custom theme provider to replace `next-themes`:

```tsx
// src/lib/theme/context.tsx
import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContext {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>('system')

  React.useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) setTheme(stored)
  }, [])

  React.useEffect(() => {
    localStorage.setItem('theme', theme)
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
```

## Running the Migration

### Development
```bash
bun run dev  # Runs TanStack Start on port 3810
```

### Building
```bash
bun run build  # Creates production build
bun run start  # Starts production server
```

### Fallback to Next.js (during migration)
```bash
bun run dev:next   # Next.js dev server
bun run build:next # Next.js build
```

## Common Issues

### 1. "Cannot find module '@tanstack/react-router'"
**Solution**: Ensure dependencies are installed: `bun install`

### 2. "routeTree.gen.ts not found"
**Solution**: Start dev server to generate route tree: `bun run dev`

### 3. "Session cookie not found"
**Solution**: Ensure middleware is configured in `src/start.ts`

### 4. Images not loading
**Solution**: Update image paths or use standard `<img>` tag instead of next/image

### 5. Hydration mismatch
**Solution**: Ensure server and client render the same HTML initially

## Performance Gains Expected

- **Dev Server**: 30-50% faster startup (Vite vs Next.js)
- **HMR**: Near-instant updates (Vite vs Turbopack)
- **Build Time**: 20-40% faster
- **Bundle Size**: 15-25% smaller (less framework overhead)
- **Memory**: 20-30% lower usage

## Next Steps

1. Convert remaining routes (use homepage as template)
2. Update all components to remove Next.js dependencies
3. Implement custom theme system
4. Update TypeScript configuration
5. Test all functionality
6. Remove Next.js dependencies
7. Deploy to production

## Production Deployment

TanStack Start builds to a Node.js server. Deploy options:
- **Vercel**: Still works (Node.js runtime)
- **Netlify**: Node.js functions
- **Docker**: Standard Node.js container
- **VPS**: Direct Node.js deployment
- **Any Node.js host**: More flexible than Next.js

Benefits: No vendor lock-in, works anywhere Node.js runs.
