import { useLocation, Link } from "@tanstack/react-router"
import { generateBreadcrumbs } from '../../lib/navigation'
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbProps {
  dynamicLabels?: Record<string, string>
}

export function Breadcrumb({ dynamicLabels }: BreadcrumbProps) {
  const location = useLocation()
  const pathname = location.pathname

  // Don't show breadcrumbs on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  const breadcrumbs = generateBreadcrumbs(pathname, dynamicLabels)

  // Don't show if only Home breadcrumb
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            const isHome = crumb.href === '/'

            return (
              <li key={crumb.href} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {isLast ? (
                  <span className="font-medium text-foreground flex items-center gap-1">
                    {isHome && <Home className="h-4 w-4" />}
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    {isHome && <Home className="h-4 w-4" />}
                    {crumb.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
