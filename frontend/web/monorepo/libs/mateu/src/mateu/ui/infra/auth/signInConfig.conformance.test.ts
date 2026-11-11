import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSignInConfig, SignInPlan, signInPlan, signInRequiredAtBoot } from './signInConfig'

/**
 * The sign-in flow corpus (conformance/client/sign-in-flow.json): what a web client makes of the
 * page's <meta name="mateu-auth">. Redwood runs the same file (poc/test-conformance.mjs).
 */
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/sign-in-flow.json', import.meta.url)), 'utf8',
)) as {
    cases: {
        name: string, auth: unknown, session: boolean,
        expected: { providers: string[][] | null, loginOnStart: boolean | null, atBoot: string, afterFailure: string }
    }[]
}

const shown = (plan: SignInPlan) => plan.show === 'provider' ? 'provider:' + plan.provider.id : plan.show

describe('sign-in flow conformance', () => {
    for (const c of corpus.cases) {
        it(c.name, () => {
            const config = parseSignInConfig(c.auth)
            expect(config ? config.providers.map((p) => [p.id, p.type, p.label, p.icon]) : null).toEqual(c.expected.providers)
            expect(config ? config.loginOnStart : null).toBe(c.expected.loginOnStart)
            expect(shown(signInPlan(config, signInRequiredAtBoot(config, c.session)))).toBe(c.expected.atBoot)
            expect(shown(signInPlan(config, true, true))).toBe(c.expected.afterFailure)
        })
    }
})
