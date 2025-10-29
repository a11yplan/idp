/// <reference types="vinxi/types/client" />
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import { getRouter } from './router'

/**
 * Client entry point for TanStack Start
 *
 * This file handles client-side hydration of the server-rendered HTML.
 * It creates a router instance and hydrates the React app into the DOM.
 */
const router = getRouter()

hydrateRoot(document, <StartClient router={router} />)
