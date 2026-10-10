// Lint for the shared lib (libs/mateu) and the Vaadin renderer (apps/vaadin).
//
// Deliberately small: the type checker already catches what most "recommended" rules would, and a
// first lint that floods thousands of style warnings gets ignored. What it pins:
//  - no-console (warn; console.warn/error stay allowed — they report real failures),
//  - @typescript-eslint/no-explicit-any (warn) — new `any`s are visible in review,
//  - no-eval / no-new-func / no-implied-eval (ERROR) — the client runs under a strict CSP with no
//    'unsafe-eval' (see infra/ui/expression.ts); RunJS is the one opt-in exception.
// CI runs it with --max-warnings at the current count (package.json "lint"), so warnings can only
// go down: ratchet the number when you remove some.
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', 'apps/redwood/**', 'apps/visual-editor/**',
            'libs/mateu/src/mateu/ui/infra/compiler/**'],
    },
    {
        files: ['libs/mateu/src/**/*.ts', 'apps/vaadin/src/**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.browser },
        },
        plugins: { '@typescript-eslint': tseslint.plugin },
        linterOptions: { reportUnusedDisableDirectives: 'off' },
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-eval': 'error',
            'no-new-func': 'error',
            'no-implied-eval': 'error',
            'no-debugger': 'error',
        },
    },
    {
        // tests may log and use any freely
        files: ['**/*.test.ts'],
        rules: { 'no-console': 'off', '@typescript-eslint/no-explicit-any': 'off' },
    },
)
