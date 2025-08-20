import { defineConfig } from 'vite'
import { resolve } from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
//    preserveSymlinks: true,
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
      'mateu': resolve(__dirname, '../../node_modules/mateu/dist/assets/mateu.js'),
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
      '/mateu': 'http://localhost:8091',
      '/images': 'http://localhost:8091',
      '/myassets': 'http://localhost:8091',
    },
  },
})
