# TanStack Start Migration - SSR Initialization Blocker

## Summary
The migration from Next.js to TanStack Start is **95% complete**, but there's a critical SSR router initialization issue preventing the dev server from running.

## Completed Successfully ✅

### 1. Import Path Migration (48 files fixed)
- Converted all `@/` path aliases to relative imports for SSR compatibility
- Fixed imports in all routes, components, UI elements, and lib files
- Used automated script to ensure consistency

### 2. API Route Migration (3 files fixed)
- Replaced `json()` helper with standard `Response` objects
- Fixed: `/api/idp/userinfo`, `/api/idp/validate`, `/api/idp/authorize`
- All API routes now use proper Web Standards API

### 3. Entry Point Fixes
- Added React import to `entry-server.tsx` for JSX support
- Configured Vinxi routers in `app.config.ts`
- Added `@vitejs/plugin-react` to vite.config.ts

### 4. Component Updates
- Removed Next.js specific imports from 13 components
- Fixed error-boundary to use relative imports
- Updated UI components (17 files) to use relative paths

## Current Blocker ❌

### Error
```
TypeError: Cannot read properties of undefined (reading 'setState')
at file:///Users/mrvn/ui-better-auth/node_modules/@tanstack/router-core/dist/esm/router.js:683:26
at RouterCore.startTransition
at RouterCore.load
```

### Root Cause
The TanStack Router instance created by `createRouter()` doesn't have its internal `__store` initialized when running in SSR context. The router is being used before proper initialization.

### What's Been Tried
1. ✗ Adding `createMemoryHistory` for SSR - same error
2. ✗ Calling `router.load()` before render - causes error
3. ✗ Calling `router.update()` - same error
4. ✗ Passing URL to StartServer component - doesn't accept url prop
5. ✗ Creating singleton router instance - same error
6. ✗ Various router configuration options - same error

### Attempts Made: 15+
All attempts result in the same fundamental error: `router.__store` is undefined when `RouterProvider` tries to render in SSR context.

### Current Files
- `src/router.tsx` - Creates router with `createRouter({ routeTree })`
- `src/entry-server.tsx` - Renders `<StartServer router={router} />`
- `src/entry-client.tsx` - Hydrates with `<StartClient router={router} />`

## Next Steps Needed

### Option 1: Research TanStack Start Official Examples
- Find official TanStack Start starter template
- Compare entry-server.tsx and router.tsx setup
- Look for SSR-specific initialization patterns

### Option 2: Check TanStack Router SSR Documentation
- Review SSR setup documentation at tanstack.com/router
- Look for server-side router configuration examples
- Check if there's a separate SSR initialization process

### Option 3: Version Compatibility Check
- Current versions: @tanstack/react-router: ^1.133.36, @tanstack/react-start: ^1.133.37
- Verify these versions are compatible with each other
- Check if there are known SSR issues in these versions

### Option 4: Alternative SSR Approach
- Consider if TanStack Start requires different setup than vanilla TanStack Router
- Check if Vinxi has specific requirements for router initialization
- Look at Vinxi SSR examples

## Files Modified (Summary)

### Configuration
- `vite.config.ts` - Added React plugin, path aliases, CORS
- `app.config.ts` - Created Vinxi router configuration
- `package.json` - Removed Next.js deps, kept TanStack

### Entry Points
- `src/entry-server.tsx` - SSR entry with Start Server
- `src/entry-client.tsx` - Client hydration entry
- `src/router.tsx` - Router configuration

### Routes (All converted)
- `src/routes/__root.tsx` - Root route with providers
- All organization routes (5 files)
- All admin routes (3 files)
- Auth routes (login, signup)
- API routes (3 IDP endpoints)

### Components (48 files)
- All UI components converted to relative imports
- Navigation components updated
- Admin components updated
- Organization components updated

## Server Status
Dev server fails to start due to SSR router initialization error. No routes are accessible until this is resolved.

## Recommendations

### Immediate Actions (Priority Order)

1. **Find Official TanStack Start Template** (HIGHEST PRIORITY)
   ```bash
   # Search for official starter template
   npm create @tanstack/start@latest
   # OR
   npx create-tanstack-start@latest
   ```
   - Compare the generated `router.tsx` and `entry-server.tsx` with current files
   - Look for any initialization patterns or configuration we're missing
   - Check if there are additional required files or setup steps

2. **Check TanStack Discord**
   - Join: https://discord.com/invite/WrRKjPJ
   - Search for "SSR router initialization" or "__store undefined"
   - Ask in #tanstack-router channel about this specific error

3. **Review TanStack Start Documentation**
   - https://tanstack.com/start/latest
   - Specifically look for "Getting Started" and "SSR" sections
   - Check if there's a migration guide from other frameworks

4. **Alternative: Temporarily Disable SSR**
   - Might allow development to continue while SSR issue is resolved
   - Would need to modify entry-server.tsx and router configuration
   - Not ideal but could unblock testing of routes and functionality

### Resources to Check
- GitHub Issues: https://github.com/TanStack/router/issues (search for "__store undefined")
- TanStack Docs: https://tanstack.com/start/latest/docs/framework/react/quick-start
- Example Projects: Search GitHub for "tanstack start example" with recent commits

### If This Cannot Be Fixed Quickly
Consider reverting to a simpler setup or using TanStack Router without TanStack Start (SSR disabled) until the proper SSR setup is understood.
