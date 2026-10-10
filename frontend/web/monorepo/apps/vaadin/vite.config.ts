import { defineConfig } from 'vite'
import { resolve } from 'path'
import type { IncomingMessage } from 'node:http'
import { vendorChunks } from '../../vite.vendorChunks'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'

// A hash of the sources the bundle is built from, stamped on the entry chunk. A source change that
// minifies to the same bytes (renaming a local, a comment) would otherwise leave the committed
// bundle untouched, and scripts/check-bundle-freshness.sh — which compares COMMITS, not bytes —
// would call it stale forever with nothing to regenerate. Same exclusions as that script.
const sourcesHash = () => {
    const files: string[] = []
    const walk = (dir: string) => {
        for (const name of readdirSync(dir).sort()) {
            const path = resolve(dir, name)
            if (statSync(path).isDirectory()) {
                if (!path.endsWith('/ui/infra/compiler')) walk(path)
            } else if (!/\.(test|spec)\.ts$/.test(name)) {
                files.push(path)
            }
        }
    }
    walk(resolve(__dirname, './src'))
    walk(resolve(__dirname, '../../libs/mateu/src'))
    const hash = createHash('sha256')
    for (const file of files) hash.update(readFileSync(file))
    return hash.digest('hex').slice(0, 16)
}

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
        ].map(path => [path, { target: 'http://localhost:8595', bypass: bypassHtml }])),
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
        // single third-party libraries (vendor-vaadin 1.6 MB eager; vendor-diagrams 1.6 MB, vendor-highcharts 0.8 MB and
        // vendor-chartjs 0.25 MB are lazy-loaded async chunks — see mateu-bpmn.ts,
        // mateu-chart.ts and elementRenderer.ts in
        // libs/mateu) that cannot be split further,
        // so raise the warning limit just above the biggest one to keep the
        // build quiet while still catching a regression to a monolithic bundle.
        chunkSizeWarningLimit: 2048,
        rollupOptions: {
            output: {
                entryFileNames: `assets/mateu-vaadin.js`,
                postBanner: (chunk) => (chunk.isEntry ? `/* mateu sources ${sourcesHash()} */` : ''),
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
                // Code-splitting: keep heavy vendors in their own chunks so the
                // entry (assets/mateu-vaadin.js) stays small. Shared with the
                // other renderer apps — see ../../vite.vendorChunks.ts.
                manualChunks: vendorChunks
            }
        },
    },
})