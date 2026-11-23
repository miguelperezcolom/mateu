import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import type { IncomingMessage } from 'node:http'
import { viewOverrides, overridesOf } from './overrides'

/**
 * The vite configuration every React renderer app (Primer, SAP, Salesforce) builds with — ONE copy:
 * an app's vite.config.ts only names itself. Node builtins only here: the packages (vite's React
 * plugin) come from the app, resolved against its own install.
 *
 * What it sets up:
 *  - the React Native renderer's core (`@rn`, imported in place) with web shims for the two core
 *    modules that import react-native / expo;
 *  - the shared tree (`@mr`, frontend/web/react-renderer) and its views over `@kit` = the app's kit
 *    (src/kit), with src/overrides/<path> replacing a shared view where the design system needs its
 *    own structure (viewOverrides) and `@app/` naming the app's own modules from an override;
 *  - libs/mateu's pure rules (`@infra`, `@mateu`) and the built-in sign-in, whose chooser is the
 *    shared React one (Lit never reaches the bundle);
 *  - the dev server proxying everything but vite's own paths to MATEU_BACKEND (a page load stays
 *    here, so a deep link boots the renderer);
 *  - the build: assets named mateu-<name>* (apart from the Vaadin jar's), lazy chunks and their
 *    stylesheets found relative to the script asking for them (a page under a public base path).
 */
export interface RendererOptions {
  /** The app's folder (its vite.config.ts passes `import.meta.dirname`). */
  appDir: string
  /** The renderer's name: its assets are assets/mateu-<name>.js / .css. */
  name: string
  /** The dev server's port. */
  port: number
  /** vite's React plugin, from the app's install. */
  react: unknown
  /** The kit's entry files under src/kit (default index.ts / icons.ts). */
  kit?: { index: string; icons: string }
}

export function rendererConfig({ appDir, name, port, react, kit = { index: 'index.ts', icons: 'icons.ts' } }: RendererOptions) {
  const rnSrc = resolve(appDir, '../../../../app/react-native/src')
  const mrSrc = resolve(appDir, '../../../react-renderer')
  const libs = resolve(appDir, '../../libs/mateu/src/mateu')
  const version: string = JSON.parse(readFileSync(resolve(appDir, 'package.json'), 'utf8')).version ?? 'unknown'
  const bypassHtml = (req: IncomingMessage) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined)
  const entry = `mateu-${name}`
  return {
    plugins: [viewOverrides({ views: resolve(mrSrc, 'views'), overrides: overridesOf(appDir) }), react],
    // ONE tsconfig for every file, the RN core's included: theirs extends expo/tsconfig.base, which
    // is only installed inside the React Native app (a fresh checkout or CI has none)
    tsconfig: resolve(appDir, 'tsconfig.json'),
    experimental: {
      renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
        return hostType === 'html' ? '/' + filename : { relative: true }
      },
    },
    define: {
      // the RN api client reads __DEV__ (Metro's global)
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      // the renderer's version, announced in X-Mateu-Renderer
      __MATEU_RENDERER_VERSION__: JSON.stringify(version),
    },
    resolve: {
      // ONE copy of each: the shared tree has no install of its own
      dedupe: ['react', 'react-dom', 'dompurify', 'marked'],
      alias: [
        { find: 'react-native', replacement: resolve(mrSrc, 'shims/react-native.ts') },
        { find: 'expo-web-browser', replacement: resolve(mrSrc, 'shims/expo-web-browser.ts') },
        { find: 'expo-file-system', replacement: resolve(mrSrc, 'shims/expo-file-system.ts') },
        { find: '@rn', replacement: rnSrc },
        { find: '@mr', replacement: mrSrc },
        { find: /^@kit\/icons$/, replacement: resolve(appDir, 'src/kit', kit.icons) },
        { find: /^@kit$/, replacement: resolve(appDir, 'src/kit', kit.index) },
        { find: /^@app\//, replacement: resolve(appDir, 'src') + '/' },
        { find: '@mateu', replacement: libs },
        { find: '@infra', replacement: resolve(libs, 'ui/infra') },
        // libs/mateu's own dependencies resolve from the app's install (it is outside the workspaces)
        { find: /^nanoid$/, replacement: resolve(appDir, 'node_modules/nanoid/index.browser.js') },
        { find: /^\.\/mateu-sign-in\.ts$/, replacement: resolve(mrSrc, 'views/shell/SignInChooser.tsx') },
      ],
    },
    server: {
      port,
      fs: { allow: ['..', '../../..', mrSrc, resolve(appDir, '../../../../app/react-native')] },
      proxy: {
        '^/(?!src/|@|node_modules/|__vite|index\\.html|$)': {
          target: process.env.MATEU_BACKEND ?? 'http://localhost:8080',
          bypass: bypassHtml,
        },
      },
    },
    build: {
      outDir: 'dist',
      // the entry's stylesheet keeps its fixed name (the served page links it); a lazy chunk's own
      // stylesheet is hashed beside its script and injected by the chunk loader
      rollupOptions: {
        output: {
          entryFileNames: `assets/${entry}.js`,
          chunkFileNames: `assets/${entry}-[name]-[hash].js`,
          assetFileNames: (a: { names?: string[] }) => {
            const asset = a.names?.[0] ?? ''
            if (!asset.endsWith('.css')) return `assets/${entry}-[name][extname]`
            return asset === 'index.css' || asset === `${entry}.css` ? `assets/${entry}.css` : `assets/${entry}-[name]-[hash][extname]`
          },
        },
      },
    },
  }
}
