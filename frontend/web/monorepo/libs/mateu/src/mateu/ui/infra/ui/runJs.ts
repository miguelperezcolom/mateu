/**
 * RunJS — the one feature that executes arbitrary JavaScript STATEMENTS sent by the server (a
 * `RunJS` rule action, a menu leaf's RunJS rule, an action's `js`). Everything else (rules,
 * conditions, `${…}` templates) is an expression and goes through the sandboxed evaluator in
 * expression.ts.
 *
 * Statements cannot be sandboxed the same way, and running them needs `new Function`, which a
 * Content Security Policy without `'unsafe-eval'` forbids. So RunJS is OFF by default and has to
 * be enabled explicitly, knowing the page then needs `'unsafe-eval'`:
 *
 *     <meta name="mateu-allow-run-js" content="true">
 *
 * or `configureRunJs(true)` before the UI boots. When disabled, the code is not run and a warning
 * says why — the rest of the rule/action still works.
 */

let configured: boolean | undefined
let warned = false

/** Enables (or disables) RunJS programmatically; wins over the `<meta>` declaration. */
export const configureRunJs = (enabled: boolean | undefined) => {
    configured = enabled
}

export const runJsAllowed = (): boolean => {
    if (configured !== undefined) return configured
    try {
        return typeof document !== 'undefined'
            && document.querySelector('meta[name="mateu-allow-run-js"]')?.getAttribute('content') === 'true'
    } catch {
        return false
    }
}

/**
 * Runs `body` as a function body with the given named arguments and `this`. Returns false (and
 * warns once) when RunJS is not enabled.
 */
export const runJs = (body: string, context: Record<string, unknown> = {}, self?: unknown): boolean => {
    if (!runJsAllowed()) {
        if (!warned) {
            warned = true
            console.warn('mateu: a RunJS rule / action js was NOT run — RunJS is disabled by default '
                + '(it needs \'unsafe-eval\' in the Content Security Policy). Enable it with '
                + '<meta name="mateu-allow-run-js" content="true"> if you rely on it.')
        }
        return false
    }
    // The only `new Function` in the client, behind the explicit opt-in above.
    // eslint-disable-next-line no-new-func
    const fn = new Function(...Object.keys(context), body)
    fn.apply(self, Object.values(context))
    return true
}

/** For tests. */
export const resetRunJs = () => {
    configured = undefined
    warned = false
}
