"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "@/lib/navigation"
import { UserMenu } from "./user-menu"
import { InvitationBadge } from "./invitation-badge"
import { OrganizationSwitcher } from "@/components/organization/org-switcher"
import { useOrganization } from "@/contexts/organization-context"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Use the auth context with error handling
  const { session, isLoading, error } = useAuth()
  const { activeOrganization, organizations } = useOrganization()

  // Don't show navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  // Don't show navbar while loading
  if (isLoading) {
    return null
  }

  // Don't show navbar if there's an error or no session
  if (error || !session?.user) {
    return null
  }

  const isAdmin = session.user.role === "admin" || session.user.role === "owner"
  const hasOrganizations = organizations.length > 0

  // Filter nav items based on auth, admin status, and organization availability
  const visibleNavItems = navItems.filter(item => {
    if (item.requiresAdmin && !isAdmin) return false
    if (item.requiresAuth && !session?.user) return false
    // Organizations and Invitations are always visible for authenticated users
    // Billing is visible for all (works with personal or org billing)
    return true
  })

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">BA</span>
              </div>
              <span className="hidden font-semibold sm:inline-block">
                Better Auth
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:gap-6 md:items-center">
              {visibleNavItems.map((item) => (
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
                  {item.label}
                </Link>
              ))}
              <OrganizationSwitcher />
            </div>
          </div>

          {/* Right side - Invitations, User menu and mobile toggle */}
          <div className="flex items-center gap-4">
            <InvitationBadge />
            <UserMenu />

            {/* Mobile menu button */}
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
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {visibleNavItems.map((item) => (
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
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
