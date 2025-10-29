# Translations Guide

This guide explains how to work with translations in the Better Auth application using next-intl.

## Overview

The application uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization (i18n) with support for:
- English (en) - Default
- German (de)

## File Structure

```
/messages
  ├── en.json    # English translations
  └── de.json    # German translations
```

## Translation Files

Translation files are organized by namespace:

```json
{
  "common": {
    "welcome": "Welcome",
    "signIn": "Sign in",
    ...
  },
  "nav": {
    "home": "Home",
    "profile": "Profile",
    ...
  },
  "auth": {
    "signInTitle": "Sign in to your account",
    ...
  }
}
```

### Available Namespaces

- `common` - Common UI elements (buttons, labels, actions)
- `nav` - Navigation items
- `auth` - Authentication pages (login, signup)
- `home` - Home page content
- `profile` - User profile pages
- `organizations` - Organization management
- `admin` - Admin panel
- `billing` - Billing & subscription
- `invitations` - Team invitations
- `validation` - Form validation messages
- `errors` - Error messages

## Usage

### Client Components

```typescript
'use client'

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('signIn')}</button>
    </div>
  )
}
```

### Server Components

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('home')

  return <h1>{t('title')}</h1>
}
```

### Multiple Namespaces

```typescript
const t = useTranslations('common')
const tAuth = useTranslations('auth')

return (
  <div>
    <h1>{tAuth('signInTitle')}</h1>
    <button>{t('cancel')}</button>
  </div>
)
```

### With Parameters

Translations support variable interpolation:

**Translation file:**
```json
{
  "home": {
    "welcomeBack": "Welcome back, {name}!"
  }
}
```

**Usage:**
```typescript
const t = useTranslations('home')
<h1>{t('welcomeBack', { name: userName })}</h1>
```

## Adding a New Language

### 1. Create Translation File

Create `/messages/[locale].json`:

```bash
cp messages/en.json messages/fr.json
```

### 2. Translate Content

Update all strings in the new file to the target language.

### 3. Update Configuration

Update `/src/config/app.config.ts`:

```typescript
export const defaultConfig: AppConfig = {
  // ...
  defaultLocale: 'en',
  availableLocales: ['en', 'de', 'fr'], // Add new locale
}
```

### 4. Update i18n Configuration

Update `/src/i18n.ts`:

```typescript
export const locales = ['en', 'de', 'fr'] as const
```

### 5. Update Language Switcher

Update `/src/components/ui/language-switcher.tsx`:

```typescript
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const
```

### 6. Test

- Restart dev server
- Use language switcher to verify translations
- Test all pages in new language

## Adding New Translation Keys

### 1. Add to English (en.json)

```json
{
  "profile": {
    "newKey": "New feature text"
  }
}
```

### 2. Add to All Other Languages

Add the same key to `de.json`, `fr.json`, etc. with translated text.

### 3. Use in Code

```typescript
const t = useTranslations('profile')
<p>{t('newKey')}</p>
```

## Best Practices

### 1. Namespace Organization

- Group related translations in appropriate namespaces
- Keep namespace names descriptive and consistent
- Don't nest too deeply (2-3 levels max)

### 2. Key Naming

- Use camelCase for keys
- Be descriptive: `signInButton` not `btn1`
- Use consistent naming patterns

**Good:**
```json
{
  "auth": {
    "signInTitle": "Sign in",
    "signInButton": "Sign in",
    "signInSuccess": "Signed in successfully"
  }
}
```

**Bad:**
```json
{
  "auth": {
    "title1": "Sign in",
    "btn": "Sign in",
    "msg": "Signed in successfully"
  }
}
```

### 3. Avoid Hardcoded Text

All user-facing text should be translatable:

**Bad:**
```typescript
<button>Sign in</button>
```

**Good:**
```typescript
const t = useTranslations('common')
<button>{t('signIn')}</button>
```

### 4. Handle Pluralization

For plural forms, create separate keys or use next-intl's plural features:

```json
{
  "items": {
    "one": "1 item",
    "other": "{count} items"
  }
}
```

### 5. Keep Translations Synchronized

- When adding a key to English, immediately add to all other languages
- Use placeholders if translation is pending: `"[TODO] English text"`
- Review translations regularly

## Language Switcher

Users can switch languages using the language switcher in the navbar:

1. Click language icon (🌐)
2. Select desired language
3. Page reloads with new language
4. Selection is persisted in cookie

## Routing

The application uses locale-aware routing:

- Default locale (en): `/profile`
- Other locales: `/de/profile`

URLs automatically adapt based on selected language.

## Translation Validation

### Check for Missing Keys

```bash
# Compare English and German files
diff <(jq -S 'keys' messages/en.json) <(jq -S 'keys' messages/de.json)
```

### Type Safety

The `TranslationNamespace` type in `/src/lib/i18n-utils.ts` ensures type-safe namespace usage:

```typescript
export type TranslationNamespace =
  | 'common'
  | 'nav'
  | 'auth'
  // ... add new namespaces here
```

## Troubleshooting

### Translations not showing

- Verify key exists in translation file
- Check namespace is correct
- Restart dev server
- Clear browser cache

### Language switcher not working

- Verify locale is in `availableLocales` config
- Check translation file exists
- Verify middleware configuration

### Locale in URL not working

- Verify middleware is configured correctly
- Check `i18n.ts` configuration
- Ensure locale is in `locales` array

## Tools & Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Google Translate](https://translate.google.com/) - For quick translations
- [DeepL](https://www.deepl.com/) - Higher quality translations
