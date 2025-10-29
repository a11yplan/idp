import { getRequestConfig } from 'next-intl/server'
import { IntlErrorCode } from 'next-intl'
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
    onError(error) {
      // Silently ignore missing translation errors
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        return
      }
      // Log other errors (potential bugs)
      console.error(error)
    },
    getMessageFallback({ namespace, key }) {
      const path = [namespace, key].filter((part) => part != null).join('.')
      return path
    },
  }
})
