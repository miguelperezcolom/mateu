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
      // allIcons is a generated icon-name table, testbench is a dev-only harness with canned messages
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/test/**', 'src/mateu/shared/apiClients/dtos/**',
        'src/mateu/ui/infra/ui/allIcons.ts', 'src/mateu/ui/infra/ui/testbench/**'],
      reporter: ['text-summary', 'json-summary'],
      // re-measured 2026-10-17 (coverage stream S5: DOM-level suites for mateu-component, the app
      // shell, mateu-ui, the listing, the rich components, capture fields and the neutral renderers):
      // 93.4% statements, 93.4% lines, 93.0% functions, 86.5% branches (was 67.9/67.9/68.5/81.3) —
      // but that was vitest 3.2.4 left in the stream's worktree. Re-measured on the lockfile's
      // vitest/@vitest/coverage-v8 4.1.11 (what CI installs), same sources and tests: 91.1% statements,
      // 92.8% lines, 88.3% functions, 80.9% branches (v8 in vitest 4 counts template-literal arrows
      // and short-circuit branches the 3.x remapper merged away).
      thresholds: {
        lines: 92,
        statements: 91,
        functions: 88,
        branches: 80,
      },
    },
  },
})
