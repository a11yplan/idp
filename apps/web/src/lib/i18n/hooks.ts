import { useI18n } from './context'
import type { Locale } from './types'

/**
 * i18n Hooks
 *
 * Custom hooks that replace next-intl's useTranslations and useLocale.
 * Provides the same API for easier migration.
 */

/**
 * Get the current locale
 *
 * Replaces: import { useLocale } from 'next-intl'
 */
export function useLocale(): Locale {
  const { locale } = useI18n()
  return locale
}

/**
 * Get translations for a specific namespace
 *
 * Replaces: import { useTranslations } from 'next-intl'
 *
 * @example
 * const t = useTranslations('common')
 * return <div>{t('hello')}</div>
 */
export function useTranslations(namespace?: string) {
  const { messages } = useI18n()

  return (key: string, values?: Record<string, any>): string => {
    // Build the full key path
    const fullKey = namespace ? `${namespace}.${key}` : key

    // Navigate through nested keys
    const keys = fullKey.split('.')
    let value: any = messages

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Return the key itself if translation not found
        return fullKey
      }
    }

    // Handle string interpolation
    if (typeof value === 'string' && values) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return key in values ? String(values[key]) : match
      })
    }

    return typeof value === 'string' ? value : fullKey
  }
}
