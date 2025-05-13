import { defineConfig } from 'vite'
import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/mateu/ui/infra/ui'),
      '@mateu': path.resolve(__dirname, './src/mateu'),
      '@application': path.resolve(__dirname, './src/mateu/ui/application'),
      '@domain': path.resolve(__dirname, './src/mateu/ui/domain'),
      '@infra': path.resolve(__dirname, './src/mateu/ui/infra'),
    },
  },
  build: {
    // lib: {
    //   entry: 'src/mateu/spikes/starter/mateu-ui.ts',
    //   formats: ['es'],
    // },
    rollupOptions: {
      //external: /^lit/,
      output: {
        entryFileNames: `assets/mateu.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
  },
  server: {
    proxy: {
      // string shorthand: http://localhost:5173/foo -> http://localhost:4567/foo
      '/helloworld': 'http://localhost:8091',
      '/mateu': 'http://localhost:8091',
      '/images': 'http://localhost:8091',
      '/myassets': 'http://localhost:8091',
      '/remoteapp/mateu': 'http://localhost:8091',
    },
  },
})
