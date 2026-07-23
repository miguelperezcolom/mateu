import { defineConfig } from 'vite'
import { resolve } from 'path'
import type { IncomingMessage } from 'node:http'
import { vendorChunks } from '../../vite.vendorChunks'

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
        ].map(path => [path, { target: 'http://localhost:8594', bypass: bypassHtml }])),
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
        // 0.6 MB eager; vendor-diagrams 1.6 MB, vendor-highcharts 0.8 MB and
        // vendor-chartjs 0.25 MB are lazy-loaded async chunks — see mateu-bpmn.ts,
        // mateu-chart.ts and elementRenderer.ts in
        // libs/mateu) that cannot be split further,
        // so raise the warning limit just above the biggest one to keep the
        // build quiet while still catching a regression to a monolithic bundle.
        chunkSizeWarningLimit: 2048,
        rollupOptions: {
            output: {
                entryFileNames: `assets/mateu-vaadin.js`,
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