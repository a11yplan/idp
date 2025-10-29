"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTranslations } from 'next-intl'
import { navItems } from "@/lib/navigation"
import { UserMenu } from "./user-menu"
import { InvitationBadge } from "./invitation-badge"
import { OrganizationSwitcher } from "@/components/organization/org-switcher"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useOrganization } from "@/contexts/organization-context"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { config } from "@/lib/config"
import { canAccessAdmin, isBetterAuthAdmin } from "@/lib/rbac"

export function Navbar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Use the auth context with error handling
  const { session, isLoading } = useAuth()
  const { organizations } = useOrganization()

  // Strip locale from pathname for comparisons
  const pathWithoutLocale = pathname.replace(/^\/(en|de)/, '') || '/'

  // Don't show navbar on login/signup pages
  if (pathWithoutLocale === '/login' || pathWithoutLocale === '/signup') {
    return null
  }

  // Don't show navbar while loading or no session
  if (isLoading || !session?.user) {
    return null
  }

  const isAdmin = canAccessAdmin(session.user)
  const isBetterAdmin = isBetterAuthAdmin(session.user)

  // Filter nav items based on auth, admin status, and feature flags
  const visibleNavItems = navItems.filter(item => {
    if (item.requiresAdmin && !isAdmin) return false
    if (item.requiresAuth && !session?.user) return false

    // Check feature flags
    if (item.href === '/organizations' && !config.features.organizations) return false
    if (item.href === '/admin' && !config.features.adminPanel) return false
    if (item.href === '/billing' && !config.features.billing) return false
    if (item.href === '/invitations' && !config.features.invitations) return false

    return true
  })

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathWithoutLocale === '/'
    }
    return pathWithoutLocale.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              {config.appLogo.endsWith('.svg') ? (
                <Image
                  src={config.appLogo}
                  alt={config.appName}
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-bold">
                    {config.appName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="hidden font-semibold sm:inline-block">
                {config.appName}
              </span>
            </Link>

            {/* Desktop Navigation - Only show for admin users */}
            {isBetterAdmin && (
              <div className="hidden md:flex md:gap-6 md:items-center">
                {visibleNavItems.map((item) => {
                  // Get translation key from href (e.g., /profile -> profile)
                  const translationKey = item.href === '/' ? 'home' : item.href.slice(1).split('/')[0]

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        isActiveRoute(item.href)
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {t(translationKey as any)}
                    </Link>
                  )
                })}
                {config.features.organizations && <OrganizationSwitcher />}
              </div>
            )}
          </div>

          {/* Right side - Language, User menu (and Invitations + Mobile toggle for admins) */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {isBetterAdmin && config.features.invitations && <InvitationBadge />}
            <UserMenu />

            {/* Mobile menu button - Only for admin users */}
            {isBetterAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only show for admin users */}
        {isBetterAdmin && mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {visibleNavItems.map((item) => {
                const translationKey = item.href === '/' ? 'home' : item.href.slice(1).split('/')[0]

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActiveRoute(item.href)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {t(translationKey as any)}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
