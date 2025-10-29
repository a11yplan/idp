# Identity Provider (IdP) Integration Guide

This Better Auth application can serve as a centralized identity provider for your other applications on the same base domain. This guide explains how to integrate your client applications with this IdP.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Configuration](#configuration)
4. [Integration Steps](#integration-steps)
5. [API Reference](#api-reference)
6. [Example Implementations](#example-implementations)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The IdP flow works as follows:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Client    │         │  Auth IdP    │         │   User Browser  │
│     App     │         │  (This App)  │         │                 │
└─────────────┘         └──────────────┘         └─────────────────┘
      │                        │                         │
      │  1. Redirect to IdP    │                         │
      ├───────────────────────>│                         │
      │  with redirect_url     │                         │
      │                        │                         │
      │                        │  2. Check auth status   │
      │                        ├────────────────────────>│
      │                        │                         │
      │                        │  3. Show login if needed│
      │                        │<────────────────────────┤
      │                        │                         │
      │                        │  4. User authenticates  │
      │                        │<────────────────────────┤
      │                        │                         │
      │  5. Redirect back      │                         │
      │<───────────────────────┤                         │
      │  with session cookie   │                         │
      │                        │                         │
      │  6. Fetch user info    │                         │
      ├───────────────────────>│                         │
      │  (with cookie)         │                         │
      │                        │                         │
      │  7. User data response │                         │
      │<───────────────────────┤                         │
```

## Prerequisites

- Your client application must be on the same base domain as the IdP
  - Example: IdP at `auth.example.com`, client at `app.example.com`
- Both applications must use secure cookies (HTTPS in production)
- IdP must be properly configured (see Configuration section)

## Configuration

### IdP Configuration

Set the following environment variables in your IdP application (this app):

```env
# Base domain for cross-subdomain cookies (include the dot prefix)
IDP_BASE_DOMAIN=.example.com

# Comma-separated list of allowed redirect domains
IDP_ALLOWED_DOMAINS=app.example.com,admin.example.com,dashboard.example.com

# Include extended profile data in responses
IDP_INCLUDE_PROFILE=true

# Include organization memberships in responses
IDP_INCLUDE_ORGANIZATIONS=true
```

### Local Development

For local development, use:

```env
IDP_BASE_DOMAIN=.localhost
IDP_ALLOWED_DOMAINS=localhost:3001,localhost:3002
```

## Integration Steps

### Step 1: Redirect to IdP

When a user needs to authenticate, redirect them to the IdP authorize endpoint:

```javascript
const redirectUrl = encodeURIComponent('https://app.example.com/auth/callback')
const clientId = 'my-app' // Optional identifier for your app
const state = generateRandomState() // Optional state parameter for CSRF protection

window.location.href = `https://auth.example.com/api/idp/authorize?redirect_url=${redirectUrl}&client_id=${clientId}&state=${state}`
```

### Step 2: Handle Callback

After authentication, the IdP will redirect back to your `redirect_url` with these parameters:

**Success:**
```
https://app.example.com/auth/callback?success=true&user_id=USER_ID&state=STATE
```

**Error:**
```
https://app.example.com/auth/callback?error=ERROR_CODE&error_description=ERROR_DESCRIPTION&state=STATE
```

### Step 3: Fetch User Information

Once redirected back, fetch the user's full profile:

```javascript
// The session cookie is automatically included
const response = await fetch('https://auth.example.com/api/idp/userinfo', {
  credentials: 'include' // Important: include cookies
})

if (response.ok) {
  const userData = await response.json()
  // userData contains user profile and organizations
  console.log(userData)
} else {
  // Handle error - user might need to re-authenticate
  console.error('Failed to fetch user info')
}
```

### Step 4: Validate Session (Optional)

To check if a session is still valid without fetching full user data:

```javascript
const response = await fetch('https://auth.example.com/api/idp/validate', {
  credentials: 'include'
})

const { valid, userId, expiresAt } = await response.json()

if (valid) {
  console.log('Session is valid until:', expiresAt)
} else {
  // Redirect to IdP for re-authentication
}
```

## API Reference

### POST /api/idp/authorize

Initiates the IdP authorization flow.

**Query Parameters:**

- `redirect_url` (required): URL to redirect back to after authentication
- `client_id` (optional): Identifier for your client application
- `state` (optional): Opaque value to maintain state (CSRF protection)

**Response:**

Redirects to login page if not authenticated, or back to `redirect_url` if authenticated.

### GET /api/idp/userinfo

Returns authenticated user's profile information.

**Headers:**

Must include session cookie (automatically sent with `credentials: 'include'`)

**Response (200 OK):**

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",

  // If IDP_INCLUDE_PROFILE=true
  "avatar": "https://...",
  "bio": "User bio",
  "phone": "+1234567890",

  // If IDP_INCLUDE_ORGANIZATIONS=true
  "organizations": [
    {
      "id": "org-id",
      "name": "Organization Name",
      "slug": "org-slug",
      "role": "member",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Response (401 Unauthorized):**

```json
{
  "error": "unauthorized",
  "error_description": "No valid session found. Please authenticate first."
}
```

### GET /api/idp/validate

Validates if the session is still active.

**Headers:**

Must include session cookie (automatically sent with `credentials: 'include'`)

**Response (200 OK):**

```json
{
  "valid": true,
  "userId": "user-id",
  "email": "user@example.com",
  "expiresAt": "2024-01-08T00:00:00Z"
}
```

## Example Implementations

### Next.js Client Application

```typescript
// lib/auth.ts
const IDP_URL = 'https://auth.example.com'
const APP_URL = 'https://app.example.com'

export async function redirectToLogin() {
  const redirectUrl = encodeURIComponent(`${APP_URL}/auth/callback`)
  const state = crypto.randomUUID()

  // Store state in sessionStorage for validation
  sessionStorage.setItem('auth_state', state)

  window.location.href = `${IDP_URL}/api/idp/authorize?redirect_url=${redirectUrl}&client_id=my-app&state=${state}`
}

export async function handleCallback() {
  const params = new URLSearchParams(window.location.search)
  const state = params.get('state')
  const storedState = sessionStorage.getItem('auth_state')

  // Validate state for CSRF protection
  if (state !== storedState) {
    throw new Error('Invalid state parameter')
  }

  // Clear stored state
  sessionStorage.removeItem('auth_state')

  // Check for errors
  if (params.get('error')) {
    throw new Error(params.get('error_description') || 'Authentication failed')
  }

  // Fetch user info
  const response = await fetch(`${IDP_URL}/api/idp/userinfo`, {
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }

  return await response.json()
}

export async function getUserInfo() {
  const response = await fetch(`${IDP_URL}/api/idp/userinfo`, {
    credentials: 'include'
  })

  if (!response.ok) {
    return null
  }

  return await response.json()
}

export async function validateSession() {
  const response = await fetch(`${IDP_URL}/api/idp/validate`, {
    credentials: 'include'
  })

  const data = await response.json()
  return data.valid
}
```

```typescript
// app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleCallback } from '@/lib/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
      .then((userData) => {
        // Store user data or update app state
        console.log('User authenticated:', userData)
        router.push('/dashboard')
      })
      .catch((err) => {
        setError(err.message)
      })
  }, [router])

  if (error) {
    return <div>Error: {error}</div>
  }

  return <div>Authenticating...</div>
}
```

```typescript
// middleware.ts - Protect routes
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const IDP_URL = 'https://auth.example.com'

export async function middleware(request: NextRequest) {
  // Check session validity
  const response = await fetch(`${IDP_URL}/api/idp/validate`, {
    headers: {
      cookie: request.headers.get('cookie') || ''
    }
  })

  const { valid } = await response.json()

  if (!valid) {
    // Redirect to login
    const redirectUrl = encodeURIComponent(request.url)
    return NextResponse.redirect(
      `${IDP_URL}/api/idp/authorize?redirect_url=${redirectUrl}`
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
}
```

### React Client Application

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'

const IDP_URL = 'https://auth.example.com'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch(`${IDP_URL}/api/idp/userinfo`, {
        credentials: 'include'
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  function login() {
    const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback')
    window.location.href = `${IDP_URL}/api/idp/authorize?redirect_url=${redirectUrl}`
  }

  return { user, loading, login }
}
```

### Node.js Backend Validation

```typescript
// Express middleware to validate sessions
import express from 'express'
import fetch from 'node-fetch'

const IDP_URL = 'https://auth.example.com'

export async function validateIdpSession(req, res, next) {
  const cookies = req.headers.cookie || ''

  try {
    const response = await fetch(`${IDP_URL}/api/idp/validate`, {
      headers: {
        cookie: cookies
      }
    })

    const { valid, userId } = await response.json()

    if (valid) {
      req.userId = userId
      next()
    } else {
      res.status(401).json({ error: 'Unauthorized' })
    }
  } catch (error) {
    console.error('Session validation failed:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Usage
app.get('/api/protected', validateIdpSession, (req, res) => {
  res.json({ message: 'Protected resource', userId: req.userId })
})
```

## Security Best Practices

### 1. Always Use HTTPS in Production

```env
# Production configuration
IDP_BASE_DOMAIN=.example.com
IDP_ALLOWED_DOMAINS=app.example.com,admin.example.com
```

### 2. Implement State Parameter for CSRF Protection

```javascript
// Generate and store state
const state = crypto.randomUUID()
sessionStorage.setItem('auth_state', state)

// Validate on callback
const receivedState = params.get('state')
if (receivedState !== sessionStorage.getItem('auth_state')) {
  throw new Error('CSRF validation failed')
}
```

### 3. Validate Redirect URLs

The IdP automatically validates redirect URLs against the allowed domains list. Only add trusted domains to `IDP_ALLOWED_DOMAINS`.

### 4. Use Secure Cookies

Cookies are automatically set as:
- `HttpOnly`: Cannot be accessed via JavaScript
- `Secure`: Only sent over HTTPS (in production)
- `SameSite=Lax`: Provides CSRF protection

### 5. Implement Session Timeout Handling

```javascript
async function ensureValidSession() {
  const response = await fetch(`${IDP_URL}/api/idp/validate`, {
    credentials: 'include'
  })

  const { valid, expiresAt } = await response.json()

  if (!valid) {
    // Session expired - redirect to login
    redirectToLogin()
    return false
  }

  // Check if session expires soon (within 1 hour)
  const expiresInMs = new Date(expiresAt).getTime() - Date.now()
  if (expiresInMs < 60 * 60 * 1000) {
    console.warn('Session expires soon')
  }

  return true
}
```

### 6. Handle Errors Gracefully

```javascript
async function safeGetUserInfo() {
  try {
    const response = await fetch(`${IDP_URL}/api/idp/userinfo`, {
      credentials: 'include'
    })

    if (response.status === 401) {
      // Unauthorized - redirect to login
      redirectToLogin()
      return null
    }

    if (!response.ok) {
      console.error('Failed to fetch user info:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Network error:', error)
    return null
  }
}
```

## Troubleshooting

### Issue: Cookies Not Being Set

**Problem:** After authentication, the session cookie is not being sent to the client app.

**Solutions:**

1. Verify both apps are on the same base domain:
   ```
   IdP: auth.example.com
   Client: app.example.com
   Base domain: .example.com ✓
   ```

2. Check `IDP_BASE_DOMAIN` is set correctly:
   ```env
   IDP_BASE_DOMAIN=.example.com  # Note the dot prefix
   ```

3. Ensure you're using `credentials: 'include'` in fetch requests:
   ```javascript
   fetch(url, { credentials: 'include' })
   ```

4. In local development, use `.localhost` as base domain:
   ```env
   IDP_BASE_DOMAIN=.localhost
   ```

### Issue: CORS Errors

**Problem:** Browser blocks requests with CORS errors.

**Solutions:**

1. Verify client domain is in `IDP_ALLOWED_DOMAINS`:
   ```env
   IDP_ALLOWED_DOMAINS=app.example.com,admin.example.com
   ```

2. Check that requests include credentials:
   ```javascript
   fetch(url, { credentials: 'include' })
   ```

3. Verify CORS headers in network tab:
   ```
   Access-Control-Allow-Origin: https://app.example.com
   Access-Control-Allow-Credentials: true
   ```

### Issue: Redirect URL Validation Failed

**Problem:** Getting error "redirect_url is not in the list of allowed domains"

**Solutions:**

1. Add your domain to allowed list:
   ```env
   IDP_ALLOWED_DOMAINS=app.example.com,admin.example.com
   ```

2. Ensure URL encoding is correct:
   ```javascript
   const redirectUrl = encodeURIComponent('https://app.example.com/callback')
   ```

3. For localhost with ports:
   ```env
   IDP_ALLOWED_DOMAINS=localhost:3001,localhost:3002
   ```

### Issue: Session Expires Quickly

**Problem:** User gets logged out frequently.

**Solutions:**

Check session configuration in `auth.ts`:

```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // 1 day
}
```

Increase `expiresIn` for longer sessions.

### Issue: Organization Data Not Included

**Problem:** `organizations` field is missing from user info.

**Solutions:**

1. Enable in configuration:
   ```env
   IDP_INCLUDE_ORGANIZATIONS=true
   ```

2. Restart the IdP application to load new env vars

3. Verify organization plugin is enabled in `auth.ts`

## Support

For issues or questions:

1. Check this documentation
2. Review the IdP configuration in `.env`
3. Check browser console for errors
4. Review IdP server logs
5. Verify Better Auth configuration in `src/lib/auth.ts`

## References

- [Better Auth Documentation](https://better-auth.com)
- [Cookie Security Best Practices](https://owasp.org/www-community/controls/SecureCookieAttribute)
- [OAuth 2.0 State Parameter](https://tools.ietf.org/html/rfc6749#section-10.12)
