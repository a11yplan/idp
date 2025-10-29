import type { Locale, Messages } from './types'
import { locales } from './types'

/**
 * i18n Message Loader
 *
 * Dynamically loads translation messages from JSON files.
 * Supports both server-side and client-side loading.
 */

/**
 * Load messages for a specific locale
 *
 * @param locale - The locale to load messages for
 * @returns The messages object
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  // Validate locale
  if (!locales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to 'en'`)
    locale = 'en'
  }

  try {
    // Dynamically import the messages file
    const messages = await import(`../../../messages/${locale}.json`)
    return messages.default || messages
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error)
    // Fallback to English if loading fails
    if (locale !== 'en') {
      return loadMessages('en')
    }
    return {}
  }
}

/**
 * Detect locale from URL path or accept-language header
 *
 * @param request - The incoming request
 * @returns The detected locale
 */
export function detectLocale(request: Request): Locale {
  // Try to get locale from URL path (e.g., /de/path or /en/path)
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)

  // Check if first segment is a valid locale
  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0]
    if (locales.includes(firstSegment as Locale)) {
      return firstSegment as Locale
    }
  }

  // Try to detect from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Parse the accept-language header (e.g., "en-US,en;q=0.9,de;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].split('-')[0].trim())

    for (const lang of languages) {
      if (locales.includes(lang as Locale)) {
        return lang as Locale
      }
    }
  }

  // Default to English
  return 'en'
}
