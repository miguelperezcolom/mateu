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
    proxy: Object.fromEntries([
      // Dev server proxies the Mateu backend (demo-admin-panel runs on :8592).
      // Same "vaadin style" shape the other renderer apps use, so e2e/conformance.sh can
      // inject its '^/.*/mateu/v3' entry and retarget everything at the SUT.
      '/fluent/mateu',
      '/mateu',
      '/myassets',
      '/sse',
      // Regex (not the '/upload' prefix): the file-upload endpoint is exactly /upload, and a
      // prefix entry would also swallow the /uploadable-image SPA route (vite prefix matching).
      '^/upload$',
    ].map(path => [path, { target: 'http://localhost:8592' }])),
  },
})
