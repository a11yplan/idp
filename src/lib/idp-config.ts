/**
 * Identity Provider (IdP) Configuration
 *
 * Manages configuration for using this Better Auth application as an
 * identity provider for other applications on the same base domain.
 */

export interface IdpConfig {
  baseDomain: string | null
  allowedDomains: string[]
  includeProfile: boolean
  includeOrganizations: boolean
}

/**
 * Get IdP configuration from environment variables
 */
export function getIdpConfig(): IdpConfig {
  return {
    baseDomain: process.env.IDP_BASE_DOMAIN || null,
    allowedDomains: process.env.IDP_ALLOWED_DOMAINS
      ? process.env.IDP_ALLOWED_DOMAINS.split(',').map((d) => d.trim())
      : [],
    includeProfile: process.env.IDP_INCLUDE_PROFILE === 'true',
    includeOrganizations: process.env.IDP_INCLUDE_ORGANIZATIONS === 'true',
  }
}

/**
 * Validate if a redirect URL is allowed based on configuration
 */
export function isRedirectUrlAllowed(redirectUrl: string, config: IdpConfig): boolean {
  try {
    const url = new URL(redirectUrl)
    const hostWithPort = url.port ? `${url.hostname}:${url.port}` : url.hostname

    // Check if the hostname (with optional port) is in allowed domains
    return config.allowedDomains.some((allowedDomain) => {
      // Parse allowed domain to handle full URLs
      let allowedHostname = allowedDomain
      let allowedPort = ''

      // If allowed domain is a full URL, extract hostname
      if (allowedDomain.startsWith('http://') || allowedDomain.startsWith('https://')) {
        try {
          const allowedUrl = new URL(allowedDomain)
          allowedHostname = allowedUrl.hostname
          allowedPort = allowedUrl.port
        } catch {
          // If parsing fails, use as-is
        }
      } else if (allowedDomain.includes(':')) {
        // Handle hostname:port format
        const [host, port] = allowedDomain.split(':')
        allowedHostname = host
        allowedPort = port
      }

      const allowedHostWithPort = allowedPort ? `${allowedHostname}:${allowedPort}` : allowedHostname

      // Exact match on hostname
      if (url.hostname === allowedHostname) {
        return true
      }

      // Exact match on hostname with port
      if (hostWithPort === allowedHostWithPort) {
        return true
      }

      // Wildcard subdomain support (e.g., *.example.com matches app.example.com)
      if (allowedDomain.startsWith('*.')) {
        const baseDomain = allowedDomain.slice(2) // Remove *.
        return url.hostname.endsWith(baseDomain)
      }

      return false
    })
  } catch (error) {
    console.error('[IdP Config] Invalid redirect URL:', redirectUrl, error)
    return false
  }
}

/**
 * Generate authorization code with expiry
 * Used for secure handoff to client applications
 */
export function generateAuthCode(): { code: string; expiresAt: Date } {
  const code = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  return { code, expiresAt }
}

/**
 * Validate authorization code expiry
 */
export function isAuthCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Build redirect URL with parameters
 */
export function buildRedirectUrl(
  baseUrl: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL(baseUrl)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value)
    }
  })

  return url.toString()
}

/**
 * Parse client ID and validate format
 */
export function parseClientId(clientId: string | null): string | null {
  if (!clientId || clientId.length === 0) {
    return null
  }

  // Client ID should be alphanumeric with optional hyphens/underscores
  const validClientIdRegex = /^[a-zA-Z0-9_-]+$/
  if (!validClientIdRegex.test(clientId)) {
    return null
  }

  return clientId
}
