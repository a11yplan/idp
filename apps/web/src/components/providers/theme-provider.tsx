'use client'

import { useEffect } from 'react'
import { config } from '@/lib/config'

/**
 * Parse HSL color string to individual components
 * Supports formats: "hsl(26 90% 58%)" or "26 90% 58%"
 */
function parseHSL(hslString: string): string {
  // Remove 'hsl(' and ')' if present, and quotes
  const cleaned = hslString
    .replace(/hsl\(/gi, '')
    .replace(/\)/g, '')
    .replace(/["']/g, '')
    .trim()

  return cleaned
}

/**
 * ThemeProvider component
 * Applies color configuration from environment variables to CSS custom properties
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement

    // Parse and apply primary color
    const primaryColor = parseHSL(config.primaryColor)
    root.style.setProperty('--primary', primaryColor)
    root.style.setProperty('--ring', primaryColor) // Ring color matches primary

    // Parse and apply secondary color
    const secondaryColor = parseHSL(config.secondaryColor)
    root.style.setProperty('--secondary', secondaryColor)

    // Parse and apply accent color
    const accentColor = parseHSL(config.accentColor)
    root.style.setProperty('--accent', accentColor)

    // For dark mode, we could adjust the lightness slightly
    // This is optional - you can customize this behavior
    const adjustForDarkMode = (hsl: string): string => {
      const parts = hsl.split(' ')
      if (parts.length === 3) {
        const [h, s, l] = parts
        const lightness = parseFloat(l)
        // Increase lightness by 10% for dark mode if it's not already very light
        const adjustedLightness = lightness < 80 ? Math.min(lightness + 10, 100) : lightness
        return `${h} ${s} ${adjustedLightness}%`
      }
      return hsl
    }

    // Apply dark mode variants (these will only apply when .dark class is present)
    const darkPrimary = adjustForDarkMode(primaryColor)
    root.style.setProperty('--primary-dark', darkPrimary)
  }, [])

  return <>{children}</>
}
