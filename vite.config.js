/* global process */
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In development every /api request is forwarded to the Django server, so the
// browser only ever talks to one origin (no CORS problems, no hard-coded hosts).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: process.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
