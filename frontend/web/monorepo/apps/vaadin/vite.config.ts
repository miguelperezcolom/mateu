import { defineConfig } from 'vite'
import { resolve } from 'path'
import type { IncomingMessage } from 'node:http'

// Return Vite's own index.html for browser navigation requests so the SPA
// router handles them, instead of letting the backend serve its static HTML.
const bypassHtml = (req: IncomingMessage) =>
    req.headers.accept?.includes('text/html') ? '/index.html' : undefined

export default defineConfig({
    resolve: {
        // 1. DEDUPE: Obliga a Vite a usar una única instancia de estas librerías críticas.
        // Esto evita el error "dom-module has already been defined".
        dedupe: [
            'lit',
            'lit-html',
            'lit-element',
            '@lit/reactive-element',
            '@vaadin/component-base',
            '@vaadin/vaadin-lumo-styles',
            '@polymer/polymer',
            '@vaadin/vaadin-themable-mixin',
            '@vaadin/vaadin-usage-statistics'
        ],
        // 2. ALIAS: Mapeo de rutas absolutas para que el monorepo no se pierda.
        alias: {
            // Corrección para componentes antiguos (VCF) que buscan carpetas /src/
            '@vaadin/component-base/src/styles/style-props.js': resolve(__dirname, '../../node_modules/@vaadin/component-base/src/styles/style-props.js'),
            '@vaadin/component-base/src/warnings.js': resolve(__dirname, '../../node_modules/@vaadin/component-base/src/warnings.js'),

            // Forzamos a que todo apunte al node_modules de la RAÍZ
            '@vaadin/component-base': resolve(__dirname, '../../node_modules/@vaadin/component-base'),
            '@vaadin/vaadin-lumo-styles': resolve(__dirname, '../../node_modules/@vaadin/vaadin-lumo-styles'),
            '@polymer/polymer': resolve(__dirname, '../../node_modules/@polymer/polymer'),
            'lit': resolve(__dirname, '../../node_modules/lit'),

            // Alias de tu aplicación
            '@': resolve(__dirname, './src'),
            '@assets': resolve(__dirname, './src/assets'),
            '@components': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra/ui'),
            '@mateu': resolve(__dirname, '../../libs/mateu/src/mateu'),
            '@application': resolve(__dirname, '../../libs/mateu/src/mateu/ui/application'),
            '@domain': resolve(__dirname, '../../libs/mateu/src/mateu/ui/domain'),
            '@infra': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra'),
        }
    },
    server: {
        fs: {
            // Permitir que Vite lea archivos fuera de apps/vaadin (necesario en monorepos)
            allow: ['..', '../../node_modules']
        },
        proxy: Object.fromEntries([
            '/fluent/mateu',
            '/declarative/mateu',
            '/counter/mateu',
            '/anothercounter/mateu',
            '/mateu',
            '/images',
            '/assets',
            '/myassets',
            '/sse',
            '/upload',
            '/master-data',
            '/call-center',
            '/_product',
            '/_crm',
            '/_financial',
            '/control-plane',
            '/workflow',
            '/_users',
            '/_shell',
            '/_content',
            '/_booking',
            '/_cp-data',
            '/_control-plane',
            '/_workflow',
            '/_forms',
            '/home2/mateu',
            '/nested-crud/mateu',
            '/users/mateu',
            '/chat/mateu',
            '/ai',
        ].map(path => [path, { target: 'http://localhost:8592', bypass: bypassHtml }])),
    },
    optimizeDeps: {
        // Excluimos el componente problemático para evitar que analice sus propios node_modules internos
        exclude: ['@vaadin-component-factory/vcf-date-range-picker'],
        include: [
            'lit',
            'lit/decorators.js',
            '@vaadin/button',
            '@vaadin/text-field',
            '@vaadin/component-base'
        ]
    },
    build: {
        // After the manualChunks split below, the remaining >500 kB chunks are
        // single third-party libraries (vendor-vaadin 1.9 MB eager, vendor-ui5
        // 0.6 MB eager; vendor-diagrams 1.6 MB and vendor-highcharts 0.8 MB are
        // lazy-loaded async chunks — see mateu-bpmn.ts, mateu-workflow-elk.ts
        // and elementRenderer.ts in libs/mateu) that cannot be split further,
        // so raise the warning limit just above the biggest one to keep the
        // build quiet while still catching a regression to a monolithic bundle.
        chunkSizeWarningLimit: 2048,
        rollupOptions: {
            output: {
                entryFileNames: `assets/mateu-vaadin.js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
                // Code-splitting: keep heavy vendors in their own chunks so the
                // entry (assets/mateu-vaadin.js) stays small. Safe with the static
                // serving model: the entry is loaded as <script type="module"
                // src="/assets/mateu-vaadin.js"> and the browser resolves the chunk
                // imports relative to that URL (all chunks live in assets/, the
                // copy script ships the whole dist folder, and the npm package
                // publishes dist/ so the jsdelivr CDN use keeps working too).
                manualChunks(id: string) {
                    if (!id.includes('node_modules')) return undefined
                    const parts = id.split('node_modules/').pop()!.split('/')
                    const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
                    // self-contained heavy leaves first (no imports back into other groups)
                    // @vaadin/charts goes with highcharts (not vendor-vaadin): it is only
                    // dynamically imported (elementRenderer.ts), so keeping the wrapper in
                    // the same chunk as highcharts makes the whole thing an async chunk.
                    if (pkg === 'highcharts' || pkg === '@vaadin/charts') return 'vendor-highcharts'
                    if (pkg === 'ol' || pkg.startsWith('ol-')
                        || pkg === 'rbush' || pkg === 'quickselect'
                        || pkg === 'geotiff' || pkg === 'earcut'
                        || pkg === 'pbf' || pkg === 'ieee754' || pkg === 'color-space'
                        || pkg === 'color-rgba' || pkg === 'color-parse' || pkg === 'color-name'
                        || pkg === 'quick-lru' || pkg === 'web-worker') return 'vendor-ol'
                    if (pkg === 'bpmn-js' || pkg === 'diagram-js' || pkg === 'diagram-js-direct-editing'
                        || pkg.startsWith('bpmn-') || pkg === 'moddle' || pkg === 'moddle-xml'
                        || pkg === 'didi' || pkg === 'saxen' || pkg === 'ids' || pkg === 'elkjs'
                        || pkg === 'min-dash' || pkg === 'min-dom' || pkg === 'tiny-svg'
                        || pkg === 'path-intersection' || pkg === 'object-refs'
                        || pkg === 'component-event' || pkg === 'domify'
                        || pkg === 'hammerjs') return 'vendor-diagrams'
                    if (pkg === 'chart.js' || pkg === 'chartjs-adapter-date-fns'
                        || pkg === 'date-fns' || pkg.startsWith('@kurkle/')
                        || pkg === '@ngyewch/chartjs-v4-webcomponent') return 'vendor-chartjs'
                    if (pkg.startsWith('@ui5/')) return 'vendor-ui5'
                    if (pkg === 'lit' || pkg === 'lit-html' || pkg === 'lit-element'
                        || pkg.startsWith('@lit/') || pkg.startsWith('@lit-labs/')) return 'vendor-lit'
                    // Vaadin/Polymer web components, plus the packages that import them
                    // (keeping them together avoids circular chunks)
                    if (pkg.startsWith('@vaadin/') || pkg.startsWith('@vaadin-component-factory/')
                        || pkg.startsWith('@polymer/') || pkg === 'lit-vaadin-helpers'
                        || pkg.startsWith('@fabricelements/') || pkg.startsWith('@web-comp/')
                        || pkg === '@alenaksu/json-viewer') return 'vendor-vaadin'
                    return 'vendor'
                }
            }
        },
    },
})