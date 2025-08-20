import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts({
    include: ['types/**/*.d.ts'],
    copyDtsFiles: true,
    outDir: 'dist/types',
  })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
      '@components': resolve(__dirname, './src/mateu/ui/infra/ui'),
      '@mateu': resolve(__dirname, './src/mateu'),
      '@application': resolve(__dirname, './src/mateu/ui/application'),
      '@domain': resolve(__dirname, './src/mateu/ui/domain'),
      '@infra': resolve(__dirname, './src/mateu/ui/infra'),
    }
  },
  build: {
    lib: {
       entry: 'src/index.ts',
       formats: ['es'],
    },
    minify: false,
    rollupOptions: {
      //external: /^lit/,
      external: [
        'lit',
      ],
      output: {
        format: "esm",
        entryFileNames: `assets/mateu.js`,
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
