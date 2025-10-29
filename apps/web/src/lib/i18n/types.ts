/**
 * i18n Types
 *
 * Type definitions for the custom i18n system
 */

export const locales = ['en', 'de'] as const
export type Locale = typeof locales[number]

export type Messages = Record<string, any>

export interface I18nConfig {
  locale: Locale
  messages: Messages
  setLocale: (locale: Locale) => void
}
