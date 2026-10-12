import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// The extension's suite runs in plain node. `vscode` only exists inside the editor, so it is aliased
// to a small disk-backed fake (src/test/vscode.ts) that lets the command/editor glue run headless.
//
// Coverage (`npm run test:coverage`, run in CI) is a ratchet: the thresholds are the measured values
// rounded down — raise them as suites grow, never lower them.
export default defineConfig({
    resolve: { alias: { vscode: resolve(__dirname, 'src/test/vscode.ts') } },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/test/**'],
            reporter: ['text-summary', 'json-summary'],
            // measured 2026-10-11 (91.4% statements, 96.3% lines, 94.4% functions, 79.7% branches; was
            // 51.4 / 52.7 / 54.0 / 52.1 before the vscode-API glue had tests)
            thresholds: { lines: 96, statements: 91, functions: 94, branches: 79 },
        },
    },
})
