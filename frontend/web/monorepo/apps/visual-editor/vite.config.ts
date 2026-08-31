import { defineConfig, type Plugin } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const here = import.meta.dirname

/**
 * Exposes the generated `uidl-schema.json` (the component authoring contract) to the editor as a
 * bundled module, so the palette and properties panel are driven by the real catalog and work with
 * NO backend (the editor also runs inside IntelliJ/VSCode where none is reachable). Reading the
 * canonical file at build time avoids a checked-in copy that would drift from the generated schema.
 */
function uidlSchemaPlugin(): Plugin {
    const virtualId = 'virtual:uidl-schema'
    const resolvedId = '\0' + virtualId
    const schemaPath = resolve(here, '../../../../../backend/shared/uidl/uidl-schema.json')
    return {
        name: 'mateu-uidl-schema',
        resolveId(id) {
            return id === virtualId ? resolvedId : undefined
        },
        load(id) {
            if (id === resolvedId) return `export default ${readFileSync(schemaPath, 'utf-8')}`
            return undefined
        },
    }
}

// The Mateu backend that serves the reserved `__preview__` / `__contract__` sync actions.
// Any running Mateu app exposes them (they are framework-reserved). Point this at your demo:
//   MATEU_BACKEND=http://localhost:8594 yarn dev
const backend = process.env.MATEU_BACKEND ?? 'http://localhost:8595'

export default defineConfig({
    plugins: [uidlSchemaPlugin()],
    // Relative asset URLs so the SAME bundle works served at a path root (JCEF embedded server,
    // browser) AND inside a VSCode webview (vscode-webview:// origin, where absolute /assets break).
    base: './',
    resolve: {
        // A single Lit instance across the app and the shared lib, or custom elements
        // get "already defined" errors (same rationale as the other renderer apps).
        dedupe: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
        alias: {
            'lit': resolve(here, '../../node_modules/lit'),
            '@': resolve(here, './src'),
            '@components': resolve(here, '../../libs/mateu/src/mateu/ui/infra/ui'),
            '@mateu': resolve(here, '../../libs/mateu/src/mateu'),
            '@application': resolve(here, '../../libs/mateu/src/mateu/ui/application'),
            '@domain': resolve(here, '../../libs/mateu/src/mateu/ui/domain'),
            '@infra': resolve(here, '../../libs/mateu/src/mateu/ui/infra'),
        },
    },
    server: {
        port: 5199,
        fs: {
            // Monorepo: allow reading the shared lib outside apps/visual-editor.
            allow: ['..', '../../node_modules'],
        },
        // Proxy the sync endpoint to the backend so the webview can fetch same-origin
        // (avoids CORS during standalone browser development).
        proxy: {
            '/mateu': { target: backend, changeOrigin: true },
            '/sse': { target: backend, changeOrigin: true },
        },
    },
})
