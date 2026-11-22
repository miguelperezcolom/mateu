import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viewOverrides, overridesOf } from '../../../react-renderer/vite/overrides'
import { resolve } from 'path'
import type { IncomingMessage } from 'node:http'
import { readFileSync } from 'node:fs'

/**
 * The SAP renderer draws with SAP's UI5 Web Components (through @ui5/webcomponents-react), and runs on the React Native renderer's core
 * (frontend/app/react-native/src/core): the controller, the session, the api client, expressions,
 * rules… That core is platform-free but for two modules, which import react-native/expo for the
 * screen-reader announcement and for opening a downloaded file — so those three imports resolve to
 * small web shims here (frontend/web/react-renderer/shims). Nothing in the core is copied.
 */
const rnSrc = resolve(import.meta.dirname, '../../../../app/react-native/src')
// the DS-neutral half of the React renderers (Primer, SAP, Salesforce): hosting, boot, listings'
// logic, shell logic, texts, resilience — source imported in place, resolved against THIS install
const mrSrc = resolve(import.meta.dirname, '../../../react-renderer')

const rendererVersion: string = JSON.parse(readFileSync(resolve(import.meta.dirname, 'package.json'), 'utf8')).version ?? 'unknown'

const bypassHtml = (req: IncomingMessage) =>
  req.headers.accept?.includes('text/html') ? '/index.html' : undefined

export default defineConfig({
  // the shared views (frontend/web/react-renderer/views) draw with `@kit` = UI5 (src/kit); where a
  // Fiori floorplan needs another STRUCTURE, src/overrides/<path> replaces the shared view at <path>
  plugins: [viewOverrides({ views: resolve(mrSrc, 'views'), overrides: overridesOf(import.meta.dirname) }), react()],
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
    // ONE copy of each: the shared tree (frontend/web/react-renderer) has no install of its own
    dedupe: ['react', 'react-dom', 'dompurify', 'marked'],
    alias: [
      { find: 'react-native', replacement: resolve(mrSrc, 'shims/react-native.ts') },
      { find: 'expo-web-browser', replacement: resolve(mrSrc, 'shims/expo-web-browser.ts') },
      { find: 'expo-file-system', replacement: resolve(mrSrc, 'shims/expo-file-system.ts') },
      { find: '@rn', replacement: rnSrc },
      { find: '@mr', replacement: mrSrc },
      { find: /^@kit\/icons$/, replacement: resolve(import.meta.dirname, 'src/kit/icons.tsx') },
      { find: /^@kit$/, replacement: resolve(import.meta.dirname, 'src/kit/index.tsx') },
      // the app's own modules, named absolutely from the overrides (a relative import there resolves from the shared view's place)
      { find: /^@app\//, replacement: resolve(import.meta.dirname, 'src') + '/' },
      { find: '@mateu', replacement: resolve(import.meta.dirname, '../../libs/mateu/src/mateu') },
      // a few pure rules are libs/mateu's (the web renderers' shared lib) — one rule, not a copy:
      // the Element attribute policy, the data-HTML sanitizer policy, the public-base rewrite, the
      // built-in sign-in flows
      { find: '@infra', replacement: resolve(import.meta.dirname, '../../libs/mateu/src/mateu/ui/infra') },
      // …whose chooser is a Lit element: here it is the SAP renderer's (src/shell/SignInChooser.tsx), so lit
      // never reaches the bundle (it is only a devDependency, for the typecheck of libs/mateu)
      // libs/mateu's own dependencies resolve from THIS app's install (it is outside the workspaces)
      { find: /^nanoid$/, replacement: resolve(import.meta.dirname, 'node_modules/nanoid/index.browser.js') },
      { find: /^\.\/mateu-sign-in\.ts$/, replacement: resolve(mrSrc, 'views/shell/SignInChooser.tsx') },
    ],
  },
  server: {
    port: 5190,
    fs: { allow: ['..', '../../..', '../../../react-renderer', '../../../../app/react-native'] },
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
        entryFileNames: 'assets/mateu-ui5.js',
        chunkFileNames: 'assets/mateu-ui5-[name]-[hash].js',
        assetFileNames: (a) => {
          const name = a.names?.[0] ?? ''
          if (!name.endsWith('.css')) return 'assets/mateu-ui5-[name][extname]'
          return name === 'index.css' || name === 'mateu-ui5.css' ? 'assets/mateu-ui5.css' : 'assets/mateu-ui5-[name]-[hash][extname]'
        },
      },
    },
  },

})
