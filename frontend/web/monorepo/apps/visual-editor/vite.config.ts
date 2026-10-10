import { defineConfig, type Plugin, type Connect } from 'vite'
import { join, resolve, sep } from 'path'
import { cpSync, existsSync, readFileSync, statSync } from 'fs'

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

/**
 * The Redwood canvas (redwood-preview.html, an iframe) boots the REAL Redwood renderer — the Visual
 * Builder app packaged in the io.mateu:redwood jar — from `redwood/`: `redwood/_index.html` and
 * `redwood/_redwood/**`. They come from the jar's resources (`MATEU_REDWOOD_STATIC` overrides the
 * folder; regenerate it with `npm run build && npm run copy` in apps/redwood after touching its poc/):
 *  - dev / `vite preview`: served from that folder; a file it does not have is asked of the backend,
 *    whose own Redwood app (one that depends on io.mateu:redwood) serves the same paths at its root;
 *  - build: copied into `dist/redwood/`, so every host that serves the bundle (IntelliJ's loopback
 *    server, VS Code's) serves the Redwood canvas too, with no backend at all.
 * JET, the Spectra components and the visual runtime are never copied: they load from Oracle's CDN.
 */
const redwoodStatic = process.env.MATEU_REDWOOD_STATIC
    ?? resolve(here, '../../../../../backend/shared/frontend/redwood/src/main/resources/static')

const CONTENT_TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2',
}
const contentTypeOf = (file: string) => CONTENT_TYPES[file.slice(file.lastIndexOf('.'))] ?? 'application/octet-stream'

function redwoodAppPlugin(): Plugin {
    const serve: Connect.NextHandleFunction = async (req, res, next) => {
        const [path, query] = (req.url ?? '').split('?')
        if (!path.startsWith('/redwood/')) return next()
        const rel = decodeURIComponent(path.slice('/redwood/'.length))
        const file = resolve(redwoodStatic, rel)
        if (file.startsWith(redwoodStatic + sep) && existsSync(file) && statSync(file).isFile()) {
            res.setHeader('Content-Type', contentTypeOf(file))
            res.setHeader('Cache-Control', 'no-cache')
            res.end(readFileSync(file))
            return
        }
        try {
            const upstream = await fetch(backend.replace(/\/$/, '') + '/' + rel + (query ? '?' + query : ''))
            res.statusCode = upstream.status
            res.setHeader('Content-Type', upstream.headers.get('content-type') ?? contentTypeOf(rel))
            res.end(Buffer.from(await upstream.arrayBuffer()))
        } catch {
            res.statusCode = 404
            res.end()
        }
    }
    return {
        name: 'mateu-redwood-app',
        configureServer(server) { server.middlewares.use(serve) },
        configurePreviewServer(server) { server.middlewares.use(serve) },
        writeBundle(options) {
            if (!options.dir) return
            if (!existsSync(join(redwoodStatic, '_index.html'))) {
                this.warn(`no Redwood app at ${redwoodStatic}: the Redwood canvas of this build needs a backend that serves it`)
                return
            }
            cpSync(redwoodStatic, join(options.dir, 'redwood'), { recursive: true })
        },
    }
}

export default defineConfig({
    plugins: [uidlSchemaPlugin(), redwoodAppPlugin()],
    // Relative asset URLs so the SAME bundle works served at a path root (JCEF embedded server,
    // browser) AND inside a VSCode webview (vscode-webview:// origin, where absolute /assets break).
    base: './',
    build: {
        // the editor, and the Redwood canvas's page (framed by the editor)
        rollupOptions: { input: { index: resolve(here, 'index.html'), 'redwood-preview': resolve(here, 'redwood-preview.html') } },
    },
    resolve: {
        // A single Lit instance across the app and the shared lib, or custom elements
        // get "already defined" errors (same rationale as the other renderer apps).
        // The Vaadin packages too: the canvas can load the Vaadin reference renderer (apps/vaadin), and
        // two copies of @vaadin/component-base mean "already defined" custom-element errors.
        dedupe: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element',
            '@vaadin/component-base', '@vaadin/vaadin-lumo-styles', '@polymer/polymer',
            '@vaadin/vaadin-themable-mixin', '@vaadin/vaadin-usage-statistics'],
        alias: {
            // Same pins as apps/vaadin (older VCF components reach into /src/ of these packages).
            '@vaadin/component-base/src/styles/style-props.js': resolve(here, '../../node_modules/@vaadin/component-base/src/styles/style-props.js'),
            '@vaadin/component-base/src/warnings.js': resolve(here, '../../node_modules/@vaadin/component-base/src/warnings.js'),
            '@vaadin/component-base': resolve(here, '../../node_modules/@vaadin/component-base'),
            '@vaadin/vaadin-lumo-styles': resolve(here, '../../node_modules/@vaadin/vaadin-lumo-styles'),
            '@polymer/polymer': resolve(here, '../../node_modules/@polymer/polymer'),
            'lit': resolve(here, '../../node_modules/lit'),
            '@': resolve(here, './src'),
            '@components': resolve(here, '../../libs/mateu/src/mateu/ui/infra/ui'),
            '@mateu': resolve(here, '../../libs/mateu/src/mateu'),
            '@application': resolve(here, '../../libs/mateu/src/mateu/ui/application'),
            '@domain': resolve(here, '../../libs/mateu/src/mateu/ui/domain'),
            '@infra': resolve(here, '../../libs/mateu/src/mateu/ui/infra'),
        },
    },
    optimizeDeps: {
        // Scan the lazily-loaded Vaadin canvas renderer up front too, or the dev server discovers its
        // deps on first use and answers "504 Outdated Optimize Dep" for that first load.
        entries: ['index.html', 'src/canvas/vaadinCanvasRenderer.ts'],
        // Same exclusion as apps/vaadin: this package's nested node_modules break the dep scan.
        exclude: ['@vaadin-component-factory/vcf-date-range-picker'],
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
