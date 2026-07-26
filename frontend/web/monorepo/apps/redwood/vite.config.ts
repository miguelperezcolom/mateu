import { defineConfig } from 'vite'
import { resolve } from 'path'
import type { IncomingMessage } from 'node:http'

// Return Vite's own index.html for browser navigation requests so the SPA router handles them,
// instead of letting the backend serve its static HTML.
const bypassHtml = (req: IncomingMessage) =>
  req.headers.accept?.includes('text/html') ? '/index.html' : undefined

/**
 * The Oracle JET / Spectra / Dynamic UI runtime is loaded from Oracle's CDN at runtime (see
 * src/oj/runtime.ts) — never bundled here. Vite only bundles our own ESM (the ported core + the
 * light-DOM Lit views). The shared libs/mateu aliases are available for later phases (DTO types,
 * localStorage stores) though Phase 0 is fully self-contained.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@mateu': resolve(__dirname, '../../libs/mateu/src/mateu'),
      '@application': resolve(__dirname, '../../libs/mateu/src/mateu/ui/application'),
      '@domain': resolve(__dirname, '../../libs/mateu/src/mateu/ui/domain'),
      '@infra': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra'),
    },
  },
  server: {
    fs: { allow: ['..', '../../node_modules'] },
    proxy: Object.fromEntries(
      ['/mateu', '/images', '/assets', '/myassets', '/sse', '/upload', '/fluent/mateu'].map((path) => [
        path,
        { target: 'http://localhost:8595', bypass: bypassHtml },
      ]),
    ),
  },
  build: {
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      output: {
        entryFileNames: `assets/mateu-redwood.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
})
