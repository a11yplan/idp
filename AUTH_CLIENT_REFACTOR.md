# Auth Client Refactor - Critical Issue

## Problem

The current `auth-client.ts` exports convenience methods directly from the auth client, which causes problems throughout the application:

```typescript
// Current problematic pattern in auth-client.ts
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  updateUser,
  changePassword,
  sendVerificationEmail,
  changeEmail,
  deleteUser,
} = authClient

export const organization = authClient.organization
export const team = authClient.organization as any  // Type assertion anti-pattern
export const admin = authClient.admin
```

## Issues

1. **Type Safety Loss**: Using `as any` to access team methods loses all type safety
2. **API Fragmentation**: Methods are scattered across multiple exports instead of being accessed through the client
3. **Inconsistent Patterns**: Some code uses `authClient.method()` while other code uses imported `method()`
4. **Maintenance Burden**: Changes to Better Auth API require updates in multiple places
5. **Runtime Errors**: Type assertions can lead to runtime errors if API changes
6. **Poor Developer Experience**: Autocomplete doesn't work properly with type assertions

## Root Cause

Better Auth client is designed to be used as a cohesive API surface:
- ✅ `authClient.signIn()`
- ✅ `authClient.organization.create()`
- ✅ `authClient.useSession()`
- ❌ Destructuring and re-exporting fragments the API

## Required Refactor

### Phase 1: Update auth-client.ts
```typescript
"use client"

import { createAuthClient } from 'better-auth/react'
import { magicLinkClient, organizationClient, adminClient } from 'better-auth/client/plugins'

/**
 * Better Auth client instance for React
 *
 * ALWAYS use this client directly with its official API:
 * - authClient.signIn()
 * - authClient.useSession()
 * - authClient.organization.create()
 *
 * DO NOT destructure or re-export methods as it breaks type safety
 * and creates inconsistent usage patterns across the application.
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  plugins: [
    magicLinkClient(),
    organizationClient({
      teams: {
        enabled: true,
      }
    }),
    adminClient(),
  ],
})
```

### Phase 2: Find and Replace All Usages

Search patterns to find:
1. `import { signIn, signUp, ... } from '@/lib/auth-client'`
2. `import { organization } from '@/lib/auth-client'`
3. `import { team } from '@/lib/auth-client'`
4. `import { admin } from '@/lib/auth-client'`
5. Direct usage of destructured methods: `signIn()`, `signOut()`, etc.

Replace with:
1. `import { authClient } from '@/lib/auth-client'`
2. `authClient.signIn()`, `authClient.signOut()`, etc.
3. `authClient.organization.create()`, etc.
4. `authClient.admin.*`, etc.

### Phase 3: Systematic Replacement Strategy

**Required steps:**
1. ✅ Complete discovery across ALL file types
2. ✅ Document ALL references with context
3. ✅ Plan update sequence based on dependencies
4. ✅ Execute coordinated changes
5. ✅ Verify completion with comprehensive search
6. ✅ Validate functionality remains working

**Critical rule:** NEVER make reactive changes. Always complete full discovery first.

## Files Likely Affected

Based on typical patterns:
- `apps/web/src/components/**/*.tsx` - UI components using auth
- `apps/web/src/app/**/page.tsx` - Page components
- `apps/web/src/contexts/**/*.tsx` - Context providers
- `apps/web/src/hooks/**/*.ts` - Custom hooks
- Any file importing from `@/lib/auth-client` or `~/lib/auth-client`

## Benefits After Refactor

1. ✅ **Type Safety**: Full TypeScript support with autocomplete
2. ✅ **Consistency**: Single, official API usage pattern
3. ✅ **Maintainability**: Changes to Better Auth propagate automatically
4. ✅ **Developer Experience**: Clear, documented API surface
5. ✅ **Reliability**: No runtime errors from type assertions
6. ✅ **Best Practices**: Follows Better Auth recommended patterns

## Timeline

- **Discovery**: Search all files for current usage patterns
- **Planning**: Map dependencies and update order
- **Execution**: Systematic replacement with validation
- **Verification**: Test all auth flows work correctly

## Reference

Location: `apps/web/src/lib/auth-client.ts:37-76`

Created: 2025-10-29
Priority: High - Affects type safety and maintainability across entire application
