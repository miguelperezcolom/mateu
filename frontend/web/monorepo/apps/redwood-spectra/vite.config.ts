import { defineConfig } from 'vite'
import { resolve } from 'path'
import { vendorChunks } from '../../vite.vendorChunks'

// Reuses the shared libs/mateu wire client + DTOs (same aliases as the other renderer apps).
// The Redwood look comes from Oracle JET 19 + Spectra UI, loaded from Oracle's CDN in index.html
// (referenced, never bundled).
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
      '@components': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra/ui'),
      '@mateu': resolve(__dirname, '../../libs/mateu/src/mateu'),
      '@application': resolve(__dirname, '../../libs/mateu/src/mateu/ui/application'),
      '@domain': resolve(__dirname, '../../libs/mateu/src/mateu/ui/domain'),
      '@infra': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra'),
    }
  },
  build: {
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      output: {
        entryFileNames: `assets/mateu-redwood-spectra.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        manualChunks: vendorChunks
      }
    },
  },
  server: {
    proxy: {
      // Dev server proxies the Mateu backend (the explorer service runs on :8595).
      '/fluent/mateu': 'http://localhost:8595',
      '/mateu': 'http://localhost:8595',
      '/myassets': 'http://localhost:8595',
      '/sse': 'http://localhost:8595',
      '/upload': 'http://localhost:8595',
    },
  },
})
