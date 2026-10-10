import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// Unit tests of the Vaadin renderer (pure helpers in node; component files opt into jsdom with a
// `// @vitest-environment jsdom` docblock). Aliases mirror vite.config.ts.
export default defineConfig({
    resolve: {
        alias: {
            '@vaadin/vaadin-usage-statistics/vaadin-usage-statistics.js': resolve(__dirname, './src/stubs/vaadin-usage-statistics.ts'),
            '@': resolve(__dirname, './src'),
            '@assets': resolve(__dirname, './src/assets'),
            '@components': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra/ui'),
            '@mateu': resolve(__dirname, '../../libs/mateu/src/mateu'),
            '@application': resolve(__dirname, '../../libs/mateu/src/mateu/ui/application'),
            '@domain': resolve(__dirname, '../../libs/mateu/src/mateu/ui/domain'),
            '@infra': resolve(__dirname, '../../libs/mateu/src/mateu/ui/infra'),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        setupFiles: ['../../libs/mateu/src/test/setup.ts', 'src/test/setup.ts'],
        // `npm run test:coverage` (CI): a ratchet over this renderer's own sources — raise the
        // thresholds as suites grow, never lower them.
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/test/**', 'src/stubs/**'],
            reporter: ['text-summary', 'json-summary'],
            // measured 2026-10-10: 12.2% lines/statements (mateu-field is 2.5k lines), 31.8% functions, 54.8% branches
            thresholds: { lines: 12, statements: 12, functions: 31, branches: 54 },
        },
    },
})
