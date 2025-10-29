import { defineConfig } from 'vite'
import path from 'path'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3810,
    host: true, // Allow connections from any host (including id.nuxt.test)
    // Allow specific hosts to connect
    allowedHosts: [
      'localhost',
      '.localhost',
      'id.nuxt.test',
      'nuxt.test',
      '.nuxt.test',
    ],
    // Allow cross-origin requests from development domains
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3810',
        'http://id.nuxt.test',
        'http://nuxt.test',
      ],
      credentials: true,
    },
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    // IMPORTANT: React's vite plugin must come after start's vite plugin
    viteReact(),
  ],
})
