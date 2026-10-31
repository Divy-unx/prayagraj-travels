import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // In dev (serve) mode, the proxy requires the backend URL
  if (command === 'serve' && !env.VITE_API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set. Copy .env.example to .env and fill in the value.')
  }

  const config = {
    plugins: [react()],
    server: {
      port: 3000,
    },
  }

  // Only add proxy in dev mode
  if (command === 'serve' && env.VITE_API_BASE_URL) {
    config.server.proxy = {
      '/api': {
        target: env.VITE_API_BASE_URL,
        changeOrigin: true,
      },
    }
  }

  return config
})
