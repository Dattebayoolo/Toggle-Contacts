import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy the Toggle Account System (auth-service on :4000) to avoid CORS.
      // The auth service mounts its router at the root with paths like
      // /auth/login, /signup/check-email and /.well-known/jwks.json.
      '/api/auth': {
        target: process.env.VITE_AUTH_BASE_URL || 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, ''),
      },
    },
  },
})
