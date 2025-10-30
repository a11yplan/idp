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
 * Applies primary brand color from environment variables to CSS custom properties
 * Secondary and accent colors use shadcn's default neutral grays from globals.css
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement

    // Parse and apply primary brand color
    const primaryColor = parseHSL(config.primaryColor)
    root.style.setProperty('--primary', primaryColor)
    root.style.setProperty('--ring', primaryColor) // Ring color matches primary
  }, [])

  return <>{children}</>
}
