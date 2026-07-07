import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This exposes the dev server to network by default
    port: 5177,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      // Proxy image requests to backend static server so /images/* works in dev
      '/images': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  publicDir: '../images', // Serve images from the shared images folder (available at /<filename>)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
