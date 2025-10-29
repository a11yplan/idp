import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { AppLogo } from "@/components/ui/app-logo"

interface AuthLayoutProps {
  children: React.ReactNode
  showLanguageSwitcher?: boolean
}

/**
 * Consistent layout for authentication pages
 * Shows app logo above content card with language switcher
 */
export function AuthLayout({
  children,
  showLanguageSwitcher = true
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher - Top Right */}
      {showLanguageSwitcher && (
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
      )}

      {/* Centered Content */}
      <div className="w-full max-w-md space-y-8">
        {/* App Logo */}
        <div className="flex justify-center">
          <AppLogo size="md" linkToHome />
        </div>

        {/* Content Card */}
        {children}
      </div>
    </div>
  )
}
