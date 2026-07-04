import { defineConfig } from 'vite'
import { resolve } from 'path'
import { vendorChunks } from '../../vite.vendorChunks'


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
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
    // After the shared vendorChunks split, the remaining >500 kB chunks are
    // single third-party libraries (vendor-ui5 and vendor-vaadin eager;
    // vendor-diagrams, vendor-highcharts and vendor-chartjs are lazy-loaded
    // async chunks — see libs/mateu) that cannot be split further, so raise
    // the warning limit just above the biggest one to keep the build quiet
    // while still catching a regression to a monolithic bundle.
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      //external: /^lit/,
      output: {
        entryFileNames: `assets/mateu-sapui5.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        // Code-splitting shared with the other renderer apps — see ../../vite.vendorChunks.ts
        manualChunks: vendorChunks
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
      '/sse': 'http://localhost:8091',
      '/upload': 'http://localhost:8091',
    },
  },
})
