import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// Unit tests for the pure logic of the shared lib (no DOM, no Lit components).
// Aliases mirror vite.config.ts so tests import modules exactly like production code.
export default defineConfig({
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
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
