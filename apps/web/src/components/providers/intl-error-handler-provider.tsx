'use client'

import { NextIntlClientProvider, IntlErrorCode } from 'next-intl'
import type { ReactNode } from 'react'

interface IntlErrorHandlerProviderProps {
  locale: string
  messages: any
  children: ReactNode
}

export function IntlErrorHandlerProvider({
  locale,
  messages,
  children,
}: IntlErrorHandlerProviderProps) {
  function onError(error: any) {
    // Silently ignore missing translation errors
    if (error.code === IntlErrorCode.MISSING_MESSAGE) {
      return
    }
    // Log other errors (potential bugs)
    console.error(error)
  }

  function getMessageFallback({ namespace, key }: { namespace?: string; key: string }) {
    const path = [namespace, key].filter((part) => part != null).join('.')
    return path
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={onError}
      getMessageFallback={getMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  )
}
