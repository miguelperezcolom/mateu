import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const here = fileURLToPath(new URL('.', import.meta.url))

// Unit tests for the visual editor's pure model logic (YAML page tree: parse/serialize, the
// preview decoration, and the path-addressed edit operations). No DOM — plain node environment.
// The lib aliases let a model module reuse libs/mateu's pure helpers (e.g. the action catalogue's
// lowering, so Play and the export ship exactly what the runtime and the server do).
export default defineConfig({
    resolve: {
        alias: {
            '@mateu': resolve(here, '../../libs/mateu/src/mateu'),
            '@infra': resolve(here, '../../libs/mateu/src/mateu/ui/infra'),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
})
