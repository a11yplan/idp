/**
 * Theme System for TanStack Start
 *
 * Custom theme provider that replaces next-themes.
 * Provides the same API for easier migration from Next.js.
 *
 * @example
 * // In root layout
 * import { ThemeProvider } from './'
 *
 * function RootComponent() {
 *   return (
 *     <ThemeProvider defaultTheme="system">
 *       <Outlet />
 *     </ThemeProvider>
 *   )
 * }
 *
 * // In components
 * import { useTheme } from './'
 *
 * function ThemeToggle() {
 *   const { theme, setTheme } = useTheme()
 *
 *   return (
 *     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *       Toggle theme
 *     </button>
 *   )
 * }
 */

export { ThemeProvider, useTheme, type Theme, type ThemeProviderProps } from './context'
