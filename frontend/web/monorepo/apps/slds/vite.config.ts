import { defineConfig } from 'vite'
import { resolve } from 'path'

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
    rollupOptions: {
      output: {
        entryFileNames: `assets/mateu-slds.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
  },
  server: {
    proxy: {
      '/fluent/mateu': 'http://localhost:8091',
      '/mateu': 'http://localhost:8091',
      '/images': 'https://demo.mateu.io',
      '/sse': 'http://localhost:8091',
      '/upload': 'http://localhost:8091',
    },
  },
})
