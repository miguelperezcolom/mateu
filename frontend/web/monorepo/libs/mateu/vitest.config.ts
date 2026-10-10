import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// Unit tests for the shared lib.
// The default environment stays `node` so the bulk of the suite runs fast; the files whose
// SUBJECT is the DOM (components, a11y live regions, focus trapping across shadow roots) opt into
// jsdom with a `// @vitest-environment jsdom` docblock of their own.
// Aliases mirror vite.config.ts so tests import modules exactly like production code.
//
// Coverage (`npm run test:coverage`, run in CI): v8, over the lib's sources. The thresholds are
// the MEASURED values rounded down — a ratchet: raise them when suites grow, never lower them.
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
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/test/**', 'src/mateu/shared/apiClients/dtos/**'],
      reporter: ['text-summary', 'json-summary'],
      // re-measured 2026-10-10 under vitest 4 (its v8 provider remaps with the AST, so functions
      // and branches are counted for real — under vitest 3 the same suite read 54.4% functions /
      // 80.6% branches): 55.0% statements, 56.1% lines, 41.0% functions, 42.2% branches
      thresholds: {
        lines: 56,
        statements: 55,
        functions: 41,
        branches: 42,
      },
    },
  },
})
