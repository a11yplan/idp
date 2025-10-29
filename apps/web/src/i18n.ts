import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

// Can be imported from a shared config
export const locales = ['en', 'de'] as const
export type Locale = typeof locales[number]

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from the request or use default
  let locale = await requestLocale

  // Fallback to default locale if not provided or invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'en'
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
