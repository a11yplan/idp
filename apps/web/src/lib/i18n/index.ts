/**
 * i18n System for TanStack Start
 *
 * Custom internationalization system that replaces next-intl.
 * Provides the same API for easier migration from Next.js.
 *
 * @example
 * // In a route loader
 * import { loadMessages, detectLocale } from './'
 *
 * export const Route = createFileRoute('/')({
 *   loader: async ({ request }) => {
 *     const locale = detectLocale(request)
 *     const messages = await loadMessages(locale)
 *     return { locale, messages }
 *   }
 * })
 *
 * // In a component
 * import { useTranslations, useLocale } from './'
 *
 * function MyComponent() {
 *   const t = useTranslations('common')
 *   const locale = useLocale()
 *
 *   return <div>{t('hello')}</div>
 * }
 */

export { I18nProvider, useI18n } from './context'
export { useTranslations, useLocale } from './hooks'
export { loadMessages, detectLocale } from './loader'
export { locales, type Locale, type Messages, type I18nConfig } from './types'
