/**
 * Debug Logger Utility
 * Provides structured logging for Better Auth operations
 * Only logs in development mode
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

interface LogOptions {
  level?: LogLevel
  context?: string
  data?: any
  error?: Error | unknown
}

/**
 * Check if we're in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Get emoji for log level
 */
function getEmoji(level: LogLevel): string {
  const emojiMap: Record<LogLevel, string> = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    debug: '🔍',
    success: '✅',
  }
  return emojiMap[level] || 'ℹ️'
}

/**
 * Get console method for log level
 */
function getConsoleMethod(level: LogLevel): 'log' | 'warn' | 'error' {
  if (level === 'error') return 'error'
  if (level === 'warn') return 'warn'
  return 'log'
}

/**
 * Format timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString().split('T')[1].split('.')[0]
}

/**
 * Core logging function
 */
function log(message: string, options: LogOptions = {}): void {
  if (!isDevelopment && options.level !== 'error') return

  const { level = 'info', context = 'App', data, error } = options
  const emoji = getEmoji(level)
  const timestamp = getTimestamp()
  const consoleMethod = getConsoleMethod(level)

  // Build log message
  const prefix = `${emoji} [${timestamp}] [${context}]`

  console[consoleMethod](prefix, message)

  // Log data if provided
  if (data !== undefined) {
    console[consoleMethod]('  📊 Data:', data)
  }

  // Log error if provided
  if (error) {
    console.error('  🔥 Error:', error)
    if (error instanceof Error && error.stack) {
      console.error('  📍 Stack:', error.stack)
    }
  }

  // Add separator for readability
  console[consoleMethod]('  ' + '─'.repeat(60))
}

/**
 * Better Auth specific loggers
 */
export const BetterAuthLogger = {
  /**
   * Log organization operations
   */
  org: {
    created: (orgId: string, orgName: string, userRole: string) => {
      log(`Organization created: ${orgName}`, {
        level: 'success',
        context: 'Organization',
        data: { orgId, orgName, userRole },
      })
    },

    roleChecked: (orgId: string, userRole: string, isOwnerOrAdmin: boolean) => {
      log(`Role checked for organization`, {
        level: 'debug',
        context: 'Organization',
        data: { orgId, userRole, isOwnerOrAdmin },
      })
    },

    listResponse: (response: any) => {
      log('Organization list response', {
        level: 'debug',
        context: 'Organization',
        data: response,
      })
    },

    error: (operation: string, error: unknown) => {
      log(`Organization ${operation} failed`, {
        level: 'error',
        context: 'Organization',
        error,
      })
    },
  },

  /**
   * Log member operations
   */
  members: {
    fetched: (count: number, orgId: string) => {
      log(`Fetched ${count} members`, {
        level: 'info',
        context: 'Members',
        data: { count, orgId },
      })
    },

    response: (response: any) => {
      log('Members API response', {
        level: 'debug',
        context: 'Members',
        data: response,
      })
    },

    removed: (userId: string) => {
      log(`Member removed: ${userId}`, {
        level: 'info',
        context: 'Members',
        data: { userId },
      })
    },

    roleUpdated: (userId: string, newRole: string) => {
      log(`Member role updated`, {
        level: 'info',
        context: 'Members',
        data: { userId, newRole },
      })
    },

    error: (operation: string, error: unknown) => {
      log(`Members ${operation} failed`, {
        level: 'error',
        context: 'Members',
        error,
      })
    },
  },

  /**
   * Log invitation operations
   */
  invitations: {
    sent: (email: string, role: string, orgName: string) => {
      log(`Invitation sent to ${email}`, {
        level: 'success',
        context: 'Invitations',
        data: { email, role, orgName },
      })
    },

    fetched: (count: number, status: string = 'all') => {
      log(`Fetched ${count} invitations`, {
        level: 'info',
        context: 'Invitations',
        data: { count, status },
      })
    },

    response: (response: any) => {
      log('Invitations API response', {
        level: 'debug',
        context: 'Invitations',
        data: response,
      })
    },

    accepted: (invitationId: string, orgName: string) => {
      log(`Invitation accepted`, {
        level: 'success',
        context: 'Invitations',
        data: { invitationId, orgName },
      })
    },

    rejected: (invitationId: string) => {
      log(`Invitation rejected`, {
        level: 'info',
        context: 'Invitations',
        data: { invitationId },
      })
    },

    cancelled: (invitationId: string) => {
      log(`Invitation cancelled`, {
        level: 'info',
        context: 'Invitations',
        data: { invitationId },
      })
    },

    resent: (invitationId: string, email: string) => {
      log(`Invitation resent to ${email}`, {
        level: 'info',
        context: 'Invitations',
        data: { invitationId, email },
      })
    },

    error: (operation: string, error: unknown) => {
      log(`Invitations ${operation} failed`, {
        level: 'error',
        context: 'Invitations',
        error,
      })
    },
  },

  /**
   * Log authentication operations
   */
  auth: {
    sessionChecked: (hasSession: boolean, userId?: string) => {
      log('Session checked', {
        level: 'debug',
        context: 'Auth',
        data: { hasSession, userId },
      })
    },

    error: (operation: string, error: unknown) => {
      log(`Auth ${operation} failed`, {
        level: 'error',
        context: 'Auth',
        error,
      })
    },
  },
}

/**
 * Generic logger
 */
export const logger = {
  info: (message: string, data?: any) => log(message, { level: 'info', data }),
  warn: (message: string, data?: any) => log(message, { level: 'warn', data }),
  error: (message: string, error?: unknown, data?: any) => log(message, { level: 'error', error, data }),
  debug: (message: string, data?: any) => log(message, { level: 'debug', data }),
  success: (message: string, data?: any) => log(message, { level: 'success', data }),
}

/**
 * Check if logging is enabled
 */
export const isLoggingEnabled = isDevelopment
