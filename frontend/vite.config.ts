import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'

const requireProductionEnv = (env: Record<string, string>) => ({
  name: 'require-production-env',
  configResolved(config: { command: string; mode: string }) {
    if (config.command !== 'build' || config.mode !== 'production') return;
    const missing = ['VITE_API_URL', 'VITE_APP_URL'].filter((key) => !env[key]?.trim());
    if (missing.length) {
      throw new Error(`Missing required production env var(s): ${missing.join(', ')}`);
    }
  },
});

// Copy routing config into the output so Vercel serves SPA routes correctly.
const copyVercelJson = {
  name: 'copy-vercel-json',
  closeBundle() {
    try { copyFileSync('vercel.json', 'dist/vercel.json'); } catch { /* skip if missing */ }
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  return {
    plugins: [react(), requireProductionEnv(env), copyVercelJson],
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
  };
})
