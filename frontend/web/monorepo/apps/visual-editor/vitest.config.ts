import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const here = import.meta.dirname

// Unit tests for the visual editor's pure model logic (YAML page tree: parse/serialize, the
// preview decoration, and the path-addressed edit operations). No DOM — plain node environment.
// The shared lib's aliases (the same as vite.config.ts) so a test can run the runtime the editor
// borrows — e.g. Play's bundle store, which answers the Redwood app's calls.
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
