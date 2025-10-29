import * as React from 'react'
import type { Locale, Messages, I18nConfig } from './types'

/**
 * i18n Context for TanStack Start
 *
 * Provides locale and translation context to all components.
 * Replaces next-intl's NextIntlClientProvider.
 */
const I18nContext = React.createContext<I18nConfig | null>(null)

export interface I18nProviderProps {
  locale: Locale
  messages: Messages
  children: React.ReactNode
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const [currentLocale, setCurrentLocale] = React.useState<Locale>(locale)

  const value = React.useMemo<I18nConfig>(
    () => ({
      locale: currentLocale,
      messages,
      setLocale: setCurrentLocale,
    }),
    [currentLocale, messages]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nConfig {
  const context = React.useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }

  return context
}
