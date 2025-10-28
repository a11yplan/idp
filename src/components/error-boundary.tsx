"use client"

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 *
 * Catches React errors and displays a fallback UI.
 * Useful for catching auth-related errors and providing recovery options.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                An unexpected error occurred. This might be due to a session issue or network problem.
              </p>
              {this.state.error && (
                <pre className="mb-4 rounded bg-muted p-2 text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} size="sm">
                  Reload Page
                </Button>
                <Button
                  onClick={() => (window.location.href = '/login')}
                  variant="outline"
                  size="sm"
                >
                  Go to Login
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Auth Error Boundary
 *
 * Specialized error boundary for authentication errors.
 * Provides auth-specific error messages and recovery options.
 */
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                There was a problem with your session. Please sign in again.
              </p>
              <Button onClick={() => (window.location.href = '/login')} size="sm">
                Go to Login
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
