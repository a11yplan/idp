# Application Configuration Guide

This guide explains how to configure your Better Auth application using the configuration system.

## Configuration Architecture

The application uses a two-tier configuration system:

1. **Default Configuration** (`src/config/app.config.ts`) - Base configuration with defaults
2. **Environment Variables** - Override defaults for deployment-specific values

## Configuration Options

### Branding

```typescript
appName: string              // Application name (displayed in nav, title)
appDescription: string       // Meta description for SEO
appLogo: string             // Path to logo file (SVG recommended)
appFavicon: string          // Path to favicon file
```

**Environment Variables:**
```bash
NEXT_PUBLIC_APP_NAME="My App"
NEXT_PUBLIC_APP_DESCRIPTION="My awesome app"
NEXT_PUBLIC_APP_LOGO="/logo.svg"
NEXT_PUBLIC_APP_FAVICON="/favicon.ico"
```

### Theme Colors

Colors are specified in HSL format for better theme integration:

```typescript
primaryColor: string        // Primary brand color
secondaryColor: string      // Secondary color
accentColor: string        // Accent color
```

**Environment Variables:**
```bash
NEXT_PUBLIC_PRIMARY_COLOR="hsl(262 83% 58%)"
NEXT_PUBLIC_SECONDARY_COLOR="hsl(0 0% 96.1%)"
NEXT_PUBLIC_ACCENT_COLOR="hsl(0 0% 96.1%)"
```

**How to choose colors:**
- Use an HSL color picker
- Format: `hsl(hue saturation% lightness%)`
- Example: Purple = `hsl(262 83% 58%)`

### Localization

```typescript
defaultLocale: 'en' | 'de'             // Default language
availableLocales: Array<'en' | 'de'>   // Supported languages
```

**Environment Variables:**
```bash
NEXT_PUBLIC_DEFAULT_LOCALE="en"
```

### Feature Flags

Enable or disable major features:

```typescript
features: {
  organizations: boolean    // Multi-tenant organizations
  adminPanel: boolean      // Admin dashboard
  billing: boolean         // Billing & subscriptions
  invitations: boolean     // Team invitations
}
```

**Environment Variables:**
```bash
NEXT_PUBLIC_FEATURE_ORGANIZATIONS="true"
NEXT_PUBLIC_FEATURE_ADMIN="true"
NEXT_PUBLIC_FEATURE_BILLING="true"
NEXT_PUBLIC_FEATURE_INVITATIONS="true"
```

### External Links

Optional links to external resources:

```typescript
links: {
  documentation?: string
  support?: string
  privacy?: string
  terms?: string
}
```

**Environment Variables:**
```bash
NEXT_PUBLIC_LINK_DOCS="https://docs.example.com"
NEXT_PUBLIC_LINK_SUPPORT="https://support.example.com"
NEXT_PUBLIC_LINK_PRIVACY="https://example.com/privacy"
NEXT_PUBLIC_LINK_TERMS="https://example.com/terms"
```

## Usage in Code

### Client Components

```typescript
import { config } from '@/lib/config'

export function MyComponent() {
  return (
    <div>
      <h1>{config.appName}</h1>
      {config.features.billing && <BillingSection />}
    </div>
  )
}
```

### Server Components

```typescript
import { config } from '@/lib/config'

export default function Page() {
  return <h1>{config.appName}</h1>
}
```

### Helper Functions

```typescript
import { isFeatureEnabled } from '@/lib/config'

if (isFeatureEnabled('organizations')) {
  // Show organizations feature
}
```

## Deployment

### Local Development

1. Copy `.env.example` to `.env.local`
2. Update values as needed
3. Restart dev server

### Production (Vercel)

1. Go to Project Settings → Environment Variables
2. Add all `NEXT_PUBLIC_*` variables
3. Redeploy

### Docker

Add environment variables to your `docker-compose.yml` or Dockerfile:

```yaml
environment:
  - NEXT_PUBLIC_APP_NAME=My App
  - NEXT_PUBLIC_PRIMARY_COLOR=hsl(262 83% 58%)
```

## Best Practices

1. **Use Environment Variables for Deployment-Specific Values**
   - URLs, API keys, feature flags per environment

2. **Use Config File for Defaults**
   - Branding, theme colors, default settings

3. **Never Commit Secrets**
   - Keep `.env.local` in `.gitignore`
   - Only commit `.env.example`

4. **Test Configuration Changes**
   - Verify all features work after config changes
   - Test with feature flags disabled

## Troubleshooting

### Configuration not updating

- Restart dev server after `.env.local` changes
- Clear `.next` cache: `rm -rf .next`
- Verify environment variable names (must start with `NEXT_PUBLIC_`)

### Logo not displaying

- Verify file exists in `/public` directory
- Check file path in config
- Ensure file is accessible (check permissions)

### Feature flag not working

- Restart dev server
- Check environment variable value (must be string "true" or "false")
- Verify feature check in code uses `isFeatureEnabled()` or `config.features.X`
