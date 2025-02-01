import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
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
      '/mateu': 'http://localhost:8091',
      '/images': 'http://localhost:8091',
      '/myassets': 'http://localhost:8091',
      '/remoteapp/mateu': 'http://localhost:8091',
    },
  },
})
