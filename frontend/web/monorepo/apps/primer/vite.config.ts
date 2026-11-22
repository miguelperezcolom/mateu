import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import type { IncomingMessage } from 'node:http'
import { readFileSync } from 'node:fs'

/**
 * The Primer renderer draws with Primer React, and runs on the React Native renderer's core
 * (frontend/app/react-native/src/core): the controller, the session, the api client, expressions,
 * rules… That core is platform-free but for two modules, which import react-native/expo for the
 * screen-reader announcement and for opening a downloaded file — so those three imports resolve to
 * small web shims here (src/shims). Nothing in the core is copied.
 */
const rnSrc = resolve(import.meta.dirname, '../../../../app/react-native/src')

const rendererVersion: string = JSON.parse(readFileSync(resolve(import.meta.dirname, 'package.json'), 'utf8')).version ?? 'unknown'

const bypassHtml = (req: IncomingMessage) =>
  req.headers.accept?.includes('text/html') ? '/index.html' : undefined

export default defineConfig({
  plugins: [react()],
  // ONE tsconfig for every file, the RN core's included: theirs extends expo/tsconfig.base, which is
  // only installed inside the React Native app (and a fresh checkout or CI has none)
  tsconfig: resolve(import.meta.dirname, 'tsconfig.json'),
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
      return hostType === 'html' ? '/' + filename : { relative: true }
    },
  },
  define: {
    // the RN api client reads __DEV__ (Metro's global)
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    // the renderer's version, announced in X-Mateu-Renderer
    __MATEU_RENDERER_VERSION__: JSON.stringify(rendererVersion),
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react-native': resolve(import.meta.dirname, 'src/shims/react-native.ts'),
      'expo-web-browser': resolve(import.meta.dirname, 'src/shims/expo-web-browser.ts'),
      'expo-file-system': resolve(import.meta.dirname, 'src/shims/expo-file-system.ts'),
      '@rn': rnSrc,
      '@mateu': resolve(import.meta.dirname, '../../libs/mateu/src/mateu'),
      // a few pure rules are libs/mateu's (the web renderers' shared lib) — one rule, not a copy:
      // the Element attribute policy, the data-HTML sanitizer policy, the public-base rewrite
      '@infra': resolve(import.meta.dirname, '../../libs/mateu/src/mateu/ui/infra'),
    },
  },
  server: {
    port: 5180,
    fs: { allow: ['..', '../../..', '../../../../app/react-native'] },
    // everything that is not vite's own goes to the backend: its Mateu paths (`/x/mateu/v3/…`), its
    // images, its static files (an Element's module, a REST endpoint)… A page load (Accept: text/html)
    // stays here, so a deep link boots the renderer.
    proxy: {
      '^/(?!src/|@|node_modules/|__vite|index\\.html|$)': {
        target: process.env.MATEU_BACKEND ?? 'http://localhost:8080',
        bypass: bypassHtml,
      },
    },
  },
  build: {
    outDir: 'dist',
    // named apart from the Vaadin jar's files (both serve from static/assets — never both on one classpath, but a stale copy must not be mistaken for ours)
    // the entry's stylesheet keeps its fixed name (the served page links it); a lazy chunk's own
    // stylesheet is hashed beside its script and injected by the chunk loader
    rollupOptions: {
      output: {
        entryFileNames: 'assets/mateu-primer.js',
        chunkFileNames: 'assets/mateu-primer-[name]-[hash].js',
        assetFileNames: (a) => {
          const name = a.names?.[0] ?? ''
          if (!name.endsWith('.css')) return 'assets/mateu-primer-[name][extname]'
          return name === 'index.css' || name === 'mateu-primer.css' ? 'assets/mateu-primer.css' : 'assets/mateu-primer-[name]-[hash][extname]'
        },
      },
    },
  },

})
