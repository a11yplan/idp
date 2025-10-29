import { Link } from "@tanstack/react-router"
import { config } from '../../lib/config'
import { cn } from "../../lib/utils"

interface AppLogoProps {
  /** Logo size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show app name next to logo */
  showName?: boolean
  /** Make logo clickable and link to home */
  linkToHome?: boolean
  /** Additional CSS classes */
  className?: string
}

const sizeMap = {
  sm: { icon: 'h-8 w-16', text: 'text-lg', wrapper: 'gap-2' },
  md: { icon: 'h-16 w-32', text: 'text-3xl', wrapper: 'gap-3' },
  lg: { icon: 'h-32 w-64', text: 'text-6xl', wrapper: 'gap-4' },
}

const sizePixels = {
  sm: { width: 64, height: 32 },
  md: { width: 128, height: 64 },
  lg: { width: 256, height: 128 },
}

/**
 * Shared app logo component with consistent branding
 * Controlled by NEXT_PUBLIC_APP_NAME and NEXT_PUBLIC_APP_LOGO environment variables
 */
export function AppLogo({
  size = 'md',
  showName = false,
  linkToHome = false,
  className
}: AppLogoProps) {
  const { icon, text, wrapper } = sizeMap[size]
  const pixelSize = sizePixels[size]

  const logoElement = (
    <div className={cn('flex items-center', wrapper, className)}>
      {/* Logo Icon or Fallback */}
      {config.appLogo ? (
        <img
          src={config.appLogo}
          alt={config.appName}
          width={pixelSize.width}
          height={pixelSize.height}
          className={icon}
        />
      ) : (
        <div className={cn(
          'flex items-center justify-center rounded-lg bg-primary text-primary-foreground',
          icon
        )}>
          <span className={cn('font-bold', text)}>
            {config.appName.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      {/* App Name */}
      {showName && (
        <span className="font-semibold hidden sm:inline-block">
          {config.appName}
        </span>
      )}
    </div>
  )

  if (linkToHome) {
    return (
      <Link to="/" className="flex items-center">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}
