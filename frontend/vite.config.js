import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // /api/anthropic → api.anthropic.com (matches the same path used in production)
        '/api/anthropic': {
          target:      'https://api.anthropic.com',
          changeOrigin: true,
          rewrite:     () => '/v1/messages',      // strip prefix, point to messages endpoint
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_ANTHROPIC_API_KEY || ''
              proxyReq.setHeader('x-api-key',         key)
              proxyReq.setHeader('anthropic-version', '2023-06-01')
            })
          },
        },
      },
    },
  }
})
