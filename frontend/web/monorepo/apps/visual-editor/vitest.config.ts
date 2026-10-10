import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const here = fileURLToPath(new URL('.', import.meta.url))

// Unit tests for the visual editor's pure model logic (YAML page tree: parse/serialize, the
// preview decoration, and the path-addressed edit operations). No DOM — plain node environment.
// The shared lib's aliases (the same as vite.config.ts) so a model module can reuse libs/mateu's
// pure helpers (e.g. the action catalogue's lowering, so Play and the export ship exactly what the
// runtime and the server do) and a test can run the runtime the editor borrows — e.g. Play's bundle
// store, which answers the Redwood app's calls.
export default defineConfig({
    resolve: {
        alias: {
            '@mateu': resolve(here, '../../libs/mateu/src/mateu'),
            '@application': resolve(here, '../../libs/mateu/src/mateu/ui/application'),
            '@domain': resolve(here, '../../libs/mateu/src/mateu/ui/domain'),
            '@infra': resolve(here, '../../libs/mateu/src/mateu/ui/infra'),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
})
