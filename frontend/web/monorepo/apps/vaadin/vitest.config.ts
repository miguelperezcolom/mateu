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
            // re-measured 2026-10-11 after the frontend coverage review (validation state on the
            // control, row selection, inline-edited cells, layouts, toasts, foldout): 35.7% lines,
            // 35.5% statements, 24.4% functions, 28.2% branches (was 13.8/13.8/6.1/8.7); after
            // merging the web UX review (2026-10-12) branches read 27.96% — floor 27. 2026-10-17
            // (coverage stream S6: every field widget, the table, cells, tree, foldout carousel and
            // the adapter's dispatch): 86.1 / 85.2 / 80.9 / 74.9
            // 2026-10-18: lines/statements 86 → 85 — mateu-field's timer-driven paths make the
            // measure swing between 85.8% and 86.1% from run to run (CI failed at 85.81 on a change
            // that touched no file of this renderer); the floor must sit below the noise.
            thresholds: { lines: 85, statements: 85, functions: 82, branches: 75 },
        },
    },
})
