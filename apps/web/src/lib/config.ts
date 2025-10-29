import { defaultConfig, type AppConfig } from '@/config/app.config'

/**
 * Get runtime configuration
 *
 * Merges default config with environment variables.
 * Environment variables take precedence over defaults.
 */
export function getConfig(): AppConfig {
  return {
    // Branding
    appName: process.env.NEXT_PUBLIC_APP_NAME || defaultConfig.appName,
    appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || defaultConfig.appDescription,
    appLogo: process.env.NEXT_PUBLIC_APP_LOGO || defaultConfig.appLogo,
    appFavicon: process.env.NEXT_PUBLIC_APP_FAVICON || defaultConfig.appFavicon,

    // Theme Colors
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || defaultConfig.primaryColor,
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || defaultConfig.secondaryColor,
    accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || defaultConfig.accentColor,

    // Localization
    defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as 'en' | 'de') || defaultConfig.defaultLocale,
    availableLocales: defaultConfig.availableLocales,

    // Features
    features: {
      organizations: process.env.NEXT_PUBLIC_FEATURE_ORGANIZATIONS !== 'false',
      adminPanel: process.env.NEXT_PUBLIC_FEATURE_ADMIN !== 'false',
      billing: process.env.NEXT_PUBLIC_FEATURE_BILLING !== 'false',
      invitations: process.env.NEXT_PUBLIC_FEATURE_INVITATIONS !== 'false',
    },

    // Links
    links: {
      documentation: process.env.NEXT_PUBLIC_LINK_DOCS,
      support: process.env.NEXT_PUBLIC_LINK_SUPPORT,
      privacy: process.env.NEXT_PUBLIC_LINK_PRIVACY,
      terms: process.env.NEXT_PUBLIC_LINK_TERMS,
    },
  }
}

/**
 * Runtime configuration instance
 */
export const config = getConfig()

/**
 * Helper to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return config.features[feature]
}
