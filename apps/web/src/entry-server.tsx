/// <reference types="vinxi/types/server" />
import React from 'react'
import { renderToReadableStream } from 'react-dom/server'
import { StartServer } from '@tanstack/react-start/server'
import { getRouter } from './router'

/**
 * Server entry point for TanStack Start
 *
 * This file handles server-side rendering of the React app.
 * It creates a router instance and renders the app to a readable stream
 * for optimal performance with streaming SSR.
 */
export default async function handler({ request }: { request: Request }) {
  const router = getRouter()

  const stream = await renderToReadableStream(<StartServer router={router} />, {
    // Bootstrap scripts and modules will be injected by Vinxi
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
