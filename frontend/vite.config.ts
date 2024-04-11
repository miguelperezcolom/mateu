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
  test: {
    browser: {
      enabled: true,
      name: 'chrome',
    },
  },
})
