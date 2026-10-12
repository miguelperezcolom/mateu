import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const here = fileURLToPath(new URL('.', import.meta.url))

// Unit tests for the visual editor's pure model logic (YAML page tree: parse/serialize, the
// preview decoration, and the path-addressed edit operations) in the plain node environment; the
// files whose SUBJECT is the browser (the host bridge over postMessage/localStorage, the Redwood
// canvas page) opt into jsdom with a `// @vitest-environment jsdom` docblock of their own.
// The shared lib's aliases (the same as vite.config.ts) so a model module can reuse libs/mateu's
// pure helpers (e.g. the action catalogue's lowering, so Play and the export ship exactly what the
// runtime and the server do) and a test can run the runtime the editor borrows — e.g. Play's bundle
// store, which answers the Redwood app's calls. `virtual:uidl-schema` (a vite plugin in the build) is
// the generated schema file itself.
//
// Coverage (`npm run test:coverage`, run in CI) is a ratchet over the editor's sources: the thresholds
// are the measured values rounded down — raise them as suites grow, never lower them.
export default defineConfig({
    resolve: {
        alias: {
            '@mateu': resolve(here, '../../libs/mateu/src/mateu'),
            '@application': resolve(here, '../../libs/mateu/src/mateu/ui/application'),
            '@domain': resolve(here, '../../libs/mateu/src/mateu/ui/domain'),
            '@infra': resolve(here, '../../libs/mateu/src/mateu/ui/infra'),
            'virtual:uidl-schema': resolve(here, '../../../../../backend/shared/uidl/uidl-schema.json'),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
            reporter: ['text-summary', 'json-summary'],
            // measured 2026-10-11: 58.5% statements, 60.2% lines, 49.5% functions, 53.9% branches (it was
            // 41.7 / 43.1 / 37.7 / 41.8 before the host bridge, the Redwood canvas page and the editor
            // element itself had tests; the panels are still mostly exercised by hand). 2026-10-12: 62.4 / 64.1 /
            // 54.3 / 56.7 with the editor's own dropdown, pickers and placement under test.
            thresholds: { lines: 64, statements: 62, functions: 54, branches: 56 },
        },
    },
})
