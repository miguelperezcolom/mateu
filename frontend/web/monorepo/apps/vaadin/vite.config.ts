import { defineConfig } from 'vite'
import { resolve } from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
//    preserveSymlinks: true,
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
      '@components': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra/ui'),
      '@mateu': resolve(__dirname, '../../libs/mateu/src/mateu'),
      '@application': resolve(__dirname, '../../libs/mateu/src/mateu/ui/application'),
      '@domain': resolve(__dirname, '../../libs/mateu/src/mateu/ui/domain'),
      '@infra': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra'),
    }
  },
  build: {
    // lib: {
    //   entry: 'src/mateu/spikes/starter/mateu-ui.ts',
    //   formats: ['es'],
    // },
    rollupOptions: {
      //external: /^lit/,
      output: {
        entryFileNames: `assets/mateu-vaadin.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
  },
  server: {
    proxy: {
      // string shorthand: http://localhost:5173/foo -> http://localhost:4567/foo
      '/fluent/mateu': 'http://localhost:8091',
        '/declarative/mateu': 'http://localhost:8091',
        '/counter/mateu': 'http://localhost:8091',
        '/anothercounter/mateu': 'http://localhost:8091',
      '/mateu': 'http://localhost:8091',
      '/images': 'http://localhost:8091',
      '/myassets': 'http://localhost:8091',
        '/assets': 'http://localhost:8091',
      '/sse': 'http://localhost:8091',
      '/upload': 'http://localhost:8091',
      '/master-data': 'http://localhost:8091',
      '/product': 'http://localhost:8091',
      '/call-center': 'http://localhost:8091',
      '/crm': 'http://localhost:8091',
      '/financial': 'http://localhost:8091',
        '/_product': 'http://localhost:8091',
        '/_crm': 'http://localhost:8091',
        '/_financial': 'http://localhost:8091',
      '/control-plane': 'http://localhost:8091',
    },
  },
})
