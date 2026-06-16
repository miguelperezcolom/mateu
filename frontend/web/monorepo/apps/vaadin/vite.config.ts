import { defineConfig } from 'vite'
import { resolve } from 'path'

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
        proxy: {
            '/fluent/mateu': 'http://localhost:8592',
            '/declarative/mateu': 'http://localhost:8592',
            '/counter/mateu': 'http://localhost:8592',
            '/anothercounter/mateu': 'http://localhost:8592',
            '/mateu': 'http://localhost:8592',
            '/images': 'http://localhost:8592',
            '/assets': 'http://localhost:8592',
            '/myassets': 'http://localhost:8592',
            '/sse': 'http://localhost:8592',
            '/upload': 'http://localhost:8592',
            '/master-data': 'http://localhost:8592',
            '/call-center': 'http://localhost:8592',
            '/_product': 'http://localhost:8592',
            '/_crm': 'http://localhost:8592',
            '/_financial': 'http://localhost:8592',
            '/control-plane': 'http://localhost:8592',
            '/workflow': 'http://localhost:8592',
            '/_users': 'http://localhost:8592',
            '/_shell': 'http://localhost:8592',
            '/_content': 'http://localhost:8592',
            '/_booking': 'http://localhost:8592',
            '/_cp-data': 'http://localhost:8592',
            '/_control-plane': 'http://localhost:8592',
            '/_workflow': 'http://localhost:8592',
            '/_forms': 'http://localhost:8592',
        '/home2/mateu': 'http://localhost:8592',
            '/nested-crud/mateu': 'http://localhost:8592',
            '/users/mateu': 'http://localhost:8592',
            '/chat/mateu': 'http://localhost:8592',
            '/ai': 'http://localhost:8592',
        },
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
        rollupOptions: {
            output: {
                entryFileNames: `assets/mateu-vaadin.js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
            }
        },
    },
})