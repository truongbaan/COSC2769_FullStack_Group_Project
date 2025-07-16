import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // frontend port
    proxy: {
      // Proxy requests that start with '/api'
      '/api': {
        target: 'http://localhost:5000', // backend port
        changeOrigin: true,
      },
    },
  },
})
