import { defineConfig } from 'vitest/config'

// Unit tests for the visual editor's pure model logic (YAML page tree: parse/serialize, the
// preview decoration, and the path-addressed edit operations). No DOM — plain node environment.
export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
})
