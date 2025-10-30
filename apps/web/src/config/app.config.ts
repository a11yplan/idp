/**
 * Application Configuration
 *
 * This file contains the default configuration for the application.
 * Values can be overridden using environment variables with the NEXT_PUBLIC_ prefix.
 *
 * Example: NEXT_PUBLIC_APP_NAME will override appName
 */

export interface AppConfig {
  // Branding
  appName: string
  appDescription: string
  appLogo: string
  appFavicon: string

  // Theme Colors (HSL format)
  // Only primary color is configurable - secondary/accent use shadcn defaults
  primaryColor: string

  // Localization
  defaultLocale: 'en' | 'de'
  availableLocales: Array<'en' | 'de'>

  // Features
  features: {
    organizations: boolean
    adminPanel: boolean
    billing: boolean
    invitations: boolean
  }

  // Links
  links: {
    documentation?: string
    support?: string
    privacy?: string
    terms?: string
  }
}

/**
 * Default configuration
 * These values will be used if no environment variables are provided
 */
export const defaultConfig: AppConfig = {
  // Branding
  appName: 'Better Auth',
  appDescription: 'Modern authentication system with Next.js',
  appLogo: '/logo.svg',
  appFavicon: '/favicon.ico',

  // Theme Colors
  // Only primary color is configurable - secondary/accent use shadcn neutral grays from globals.css
  primaryColor: 'hsl(262 83% 58%)', // Purple

  // Localization
  defaultLocale: 'en',
  availableLocales: ['en', 'de'],

  // Features
  features: {
    organizations: true,
    adminPanel: true,
    billing: false,
    invitations: true,
  },

  // Links
  links: {
    documentation: undefined,
    support: undefined,
    privacy: undefined,
    terms: undefined,
  },
}
