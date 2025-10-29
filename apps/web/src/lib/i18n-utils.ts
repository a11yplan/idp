import { useTranslations as useNextIntlTranslations } from 'next-intl'
import { getTranslations as getNextIntlTranslations } from 'next-intl/server'

/**
 * Client-side translation hook
 *
 * @example
 * const t = useTranslations('common')
 * return <p>{t('welcome')}</p>
 */
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace)
}

/**
 * Server-side translation function
 *
 * @example
 * const t = await getTranslations('auth')
 * return <h1>{t('signInTitle')}</h1>
 */
export async function getTranslations(namespace?: string) {
  return await getNextIntlTranslations(namespace)
}

/**
 * Type-safe translation keys helper
 * Ensures consistency between code and translation files
 */
export type TranslationNamespace =
  | 'common'
  | 'nav'
  | 'auth'
  | 'home'
  | 'profile'
  | 'organizations'
  | 'admin'
  | 'billing'
  | 'invitations'
  | 'validation'
  | 'errors'
