import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'

// Plugin: copy vercel.json into dist so SPA routing works on Vercel deployments
const copyVercelJson = {
  name: 'copy-vercel-json',
  closeBundle() {
    try { copyFileSync('vercel.json', 'dist/vercel.json'); } catch { /* skip if missing */ }
  },
};

export default defineConfig({
  plugins: [react(), copyVercelJson],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
