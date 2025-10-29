import { createApp } from 'vinxi'

export default createApp({
  routers: [
    {
      name: 'public',
      type: 'static',
      dir: './public',
      base: '/',
    },
    {
      name: 'client',
      type: 'client',
      handler: './src/entry-client.tsx',
      target: 'browser',
      base: '/_build',
    },
    {
      name: 'server',
      type: 'http',
      handler: './src/entry-server.tsx',
      target: 'server',
      base: '/',
    },
  ],
})
