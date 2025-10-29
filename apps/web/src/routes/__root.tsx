import * as React from 'react'
import { createRootRoute, Outlet, ScrollRestoration, Scripts, HeadContent } from '@tanstack/react-router'
import { config } from '../lib/config'
import { ErrorBoundary } from '../components/error-boundary'
import { ThemeProvider } from '../lib/theme'
import { I18nProvider } from '../lib/i18n'
import { loadMessages, detectLocale } from '../lib/i18n'
import '../globals.css'

/**
 * Root route for TanStack Start application
 *
 * This route provides:
 * - HTML document structure
 * - Global styles and fonts
 * - Theme provider (dark/light mode)
 * - i18n provider (translations)
 * - Error boundaries
 * - Scripts and metadata injection
 */
export const Route = createRootRoute({
  loader: async ({ request }) => {
    // Detect locale from request
    const locale = detectLocale(request)
    // Load messages for the locale
    const messages = await loadMessages(locale)

    return { locale, messages }
  },
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
})

function RootComponent() {
  const { locale, messages } = Route.useLoaderData()

  return (
    <RootDocument>
      <ThemeProvider defaultTheme="system">
        <I18nProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </I18nProvider>
      </ThemeProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{config.appName}</title>
        <meta name="description" content={config.appDescription} />
        <link rel="icon" href={config.appFavicon} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <RootDocument>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-4xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error.message}</p>
          <a href="/" className="text-primary hover:underline">
            Go back home
          </a>
        </div>
      </div>
    </RootDocument>
  )
}

function RootNotFoundComponent() {
  return (
    <RootDocument>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">Page not found</p>
          <a href="/" className="text-primary hover:underline">
            Go back home
          </a>
        </div>
      </div>
    </RootDocument>
  )
}
