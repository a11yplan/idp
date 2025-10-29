# TanStack Start Migration - Quick Start Guide

## ⚡ Current Status

**75% Complete** - Core infrastructure is ready, remaining work is route conversion.

---

## 🚀 Start Development Server

```bash
# Start TanStack Start dev server
bun run dev

# Server will be available at: http://localhost:3810
```

**First run will**:
- Generate `src/routeTree.gen.ts` automatically
- Compile TypeScript
- Start dev server with HMR

---

## 📝 Convert Your First Route

### Example: Convert Login Page

1. **Read the Next.js page**:
```bash
cat src/app/login/page.tsx
```

2. **Create the TanStack route**:
```bash
# Create the new file
touch src/routes/login.tsx
```

3. **Copy this template**:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { loadMessages } from '@/lib/i18n'

export const Route = createFileRoute('/login')({
  loader: async ({ request }) => {
    const messages = await loadMessages('en')
    return { messages }
  },
  component: LoginPage,
})

function LoginPage() {
  const { messages } = Route.useLoaderData()

  // Copy component logic from src/app/login/page.tsx
  // Remove "use client"
  // Change: import Link from 'next/link' → import { Link } from '@tanstack/react-router'
  // Change: href → to

  return <div>Login Page</div>
}
```

4. **Test it**:
```bash
# Dev server auto-reloads
# Visit: http://localhost:3810/login
```

---

## 🎯 Priority Order

Convert routes in this order for fastest results:

### **Phase 1: Authentication (30 min)**
```
1. src/routes/login.tsx          ← src/app/login/page.tsx
2. src/routes/signup.tsx         ← src/app/signup/page.tsx
```

**Why first?** - Auth flow is critical for everything else.

### **Phase 2: Core Pages (45 min)**
```
3. src/routes/profile/index.tsx          ← src/app/profile/page.tsx
4. src/routes/profile/settings/index.tsx ← src/app/profile/settings/page.tsx
5. src/routes/pricing/index.tsx          ← src/app/pricing/page.tsx
6. src/routes/billing/index.tsx          ← src/app/billing/page.tsx
```

**Why next?** - Simple pages, test patterns work.

### **Phase 3: Organizations (90 min)**
```
7. src/routes/organizations/index.tsx                           ← src/app/organizations/page.tsx
8. src/routes/organizations/create.tsx                          ← src/app/organizations/create/page.tsx
9. src/routes/organizations/$id/index.tsx                       ← src/app/organizations/[id]/page.tsx
10. src/routes/organizations/$id/members/index.tsx              ← src/app/organizations/[id]/members/page.tsx
11. src/routes/organizations/$id/settings/index.tsx             ← src/app/organizations/[id]/settings/page.tsx
12. src/routes/organizations/$id/teams/index.tsx                ← src/app/organizations/[id]/teams/page.tsx
13. src/routes/organizations/$id/teams/$teamId/index.tsx        ← src/app/organizations/[id]/teams/[teamId]/page.tsx
14. src/routes/organizations/$id/teams/$teamId/settings/index.tsx ← src/app/organizations/[id]/teams/[teamId]/settings/page.tsx
```

**Why third?** - Core business logic, complex but well-established pattern.

### **Phase 4: Admin & Invitations (60 min)**
```
15. src/routes/admin/index.tsx              ← src/app/admin/page.tsx
16. src/routes/admin/organizations/index.tsx ← src/app/admin/organizations/page.tsx
17. src/routes/admin/users/index.tsx        ← src/app/admin/users/page.tsx
18. src/routes/admin/users/$id/index.tsx    ← src/app/admin/users/[id]/page.tsx
19. src/routes/invitations/index.tsx        ← src/app/invitations/page.tsx
20. src/routes/accept-invitation/$id.tsx    ← src/app/accept-invitation/[id]/page.tsx
```

**Why last?** - Admin features, less critical for testing.

---

## 🔧 Common Patterns

### Pattern 1: Simple Static Page

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

function PricingPage() {
  return <div>Pricing content</div>
}
```

### Pattern 2: Page with Translations

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { loadMessages } from '@/lib/i18n'

export const Route = createFileRoute('/profile')({
  loader: async () => {
    const messages = await loadMessages('en')
    return { messages }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { messages } = Route.useLoaderData()
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = messages
    for (const k of keys) value = value?.[k]
    return value || key
  }

  return <div>{t('profile.title')}</div>
}
```

### Pattern 3: Protected Page with Session

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '@/lib/auth'
import { loadMessages } from '@/lib/i18n'

export const Route = createFileRoute('/admin')({
  loader: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      throw redirect({ to: '/login' })
    }

    const messages = await loadMessages('en')
    return { session, messages }
  },
  component: AdminPage,
})

function AdminPage() {
  const { session, messages } = Route.useLoaderData()
  return <div>Welcome {session.user.email}</div>
}
```

### Pattern 4: Dynamic Route with Params

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/auth'
import { loadMessages } from '@/lib/i18n'

export const Route = createFileRoute('/organizations/$id')({
  loader: async ({ request, params }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    const organizationId = params.id
    const messages = await loadMessages('en')

    return { session, organizationId, messages }
  },
  component: OrganizationPage,
})

function OrganizationPage() {
  const { session, organizationId, messages } = Route.useLoaderData()
  return <div>Organization: {organizationId}</div>
}
```

---

## ✅ Testing Checklist

After converting each route, test:

```bash
# 1. Route loads
curl http://localhost:3810/your-route

# 2. Check browser
open http://localhost:3810/your-route

# 3. Check console (no errors)
# 4. Check network tab (proper responses)
# 5. Test navigation (links work)
```

---

## 🐛 Quick Fixes

### Route not found
**Problem**: 404 error

**Solution**: Make sure filename matches route path:
- `/login` → `src/routes/login.tsx` (not `login/index.tsx`)
- `/profile` → `src/routes/profile/index.tsx`
- `/organizations` → `src/routes/organizations/index.tsx`

### Module not found
**Problem**: `Cannot find module '@/lib/...'`

**Solution**: Check tsconfig.json has path alias:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

### Hydration mismatch
**Problem**: Warning about hydration mismatch

**Solution**: Ensure server and client render the same content initially. Check for `typeof window` checks.

### Session not working
**Problem**: Always redirected to login

**Solution**: Check middleware is running:
1. Verify `src/start.ts` exports `startInstance`
2. Check middleware order: CORS → Auth
3. Test API endpoint directly: `curl http://localhost:3810/api/auth/session`

---

## 📊 Progress Tracking

Create a checklist:

```markdown
## Route Conversion Progress

- [x] / (Homepage)
- [x] /api/auth/* (Better Auth)
- [x] /api/idp/* (IdP endpoints)
- [ ] /login
- [ ] /signup
- [ ] /profile
- [ ] /profile/settings
- [ ] /pricing
- [ ] /billing
- [ ] /organizations
- [ ] /organizations/create
- [ ] /organizations/$id
- [ ] /organizations/$id/members
- [ ] /organizations/$id/settings
- [ ] /organizations/$id/teams
- [ ] /organizations/$id/teams/$teamId
- [ ] /organizations/$id/teams/$teamId/settings
- [ ] /admin
- [ ] /admin/organizations
- [ ] /admin/users
- [ ] /admin/users/$id
- [ ] /invitations
- [ ] /accept-invitation/$id
```

---

## 🎉 When Complete

1. **Test everything**:
```bash
bun run build
bun run start
# Test in production mode
```

2. **Remove Next.js** (optional, can keep as fallback):
```bash
bun remove next next-intl next-themes eslint-config-next
rm -rf src/app/
rm next.config.ts middleware.ts next-env.d.ts
```

3. **Deploy**:
- TanStack Start builds to Node.js
- Deploy to Vercel, Netlify, or any Node.js host
- No vendor lock-in!

---

## 💡 Tips for Speed

1. **Copy-paste template** from `TANSTACK_MIGRATION_GUIDE.md`
2. **Convert in batches** - do 2-3 routes at a time
3. **Test incrementally** - don't wait until all routes are done
4. **Keep Next.js running** - `bun run dev:next` as fallback
5. **Use search & replace** - VS Code multi-cursor editing
6. **Focus on patterns** - once you get one right, others are similar

---

## 🆘 Need Help?

1. **Check migration guide**: `TANSTACK_MIGRATION_GUIDE.md`
2. **Check status**: `MIGRATION_STATUS.md`
3. **Check example**: `src/routes/index.tsx` (homepage)
4. **Check TanStack docs**: https://tanstack.com/start

---

## ⏱️ Time Estimates

- **Auth pages** (login, signup): 15 min each = 30 min
- **Simple pages** (profile, pricing): 10 min each = 40 min
- **Complex pages** (organizations): 15-20 min each = 2 hours
- **Admin pages**: 15 min each = 1 hour
- **Component updates**: 1 hour
- **Testing & fixes**: 1 hour

**Total: 5-6 hours focused work**

---

## 🚀 Start Now!

```bash
# 1. Start dev server
bun run dev

# 2. Open in browser
open http://localhost:3810

# 3. Start with login page
code src/routes/login.tsx

# 4. Follow the template
# 5. Test
# 6. Move to next route
# 7. Repeat!
```

**You've got this!** The hard infrastructure work is done. Now it's just following the pattern. 🎯
