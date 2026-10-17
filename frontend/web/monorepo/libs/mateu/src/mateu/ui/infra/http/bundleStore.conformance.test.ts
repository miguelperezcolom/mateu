import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { __setBundleForTests, applyRouteParams, matchBundledTemplate, toSyncPath } from './bundleStore'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'

/**
 * The client conformance corpus for route parameters (conformance/client/route-params.json): the
 * same file the Redwood suite runs, so a statically served route answers the same on both.
 */
type Json = Record<string, unknown>
interface Case {
    name: string
    routes: Json[]
    template?: { routePattern: string; paramNames: string[] }
    syncPath: string
    increment: Json
    expected: { untouched?: boolean; appState?: Json; fragments?: { state: Json; data: Json; initialData?: Json }[] }
}
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/route-params.json', import.meta.url)), 'utf8',
)) as { cases: Case[]; syncPaths: { route: string; expected: string }[] }

describe('client conformance corpus — route params (web)', () => {
    afterEach(() => __setBundleForTests(undefined))

    for (const c of corpus.cases) {
        it(c.name, () => {
            const increment = structuredClone(c.increment) as unknown as UIIncrement
            const templates = c.template
                ? [{ regex: new RegExp(c.template.routePattern), paramNames: c.template.paramNames, increment }]
                : []
            __setBundleForTests(undefined, templates, c.routes as never)
            const out = c.template ? matchBundledTemplate(c.syncPath) : applyRouteParams(c.syncPath, increment)
            if (c.expected.untouched) {
                expect(out).toBe(increment)
                return
            }
            const result = out as unknown as Json & { fragments: Json[] }
            expect(result.appState).toEqual('appState' in c.expected ? c.expected.appState : c.increment.appState)
            expect(result.fragments.length).toBe(c.expected.fragments!.length)
            c.expected.fragments!.forEach((f, i) => {
                const actual = result.fragments[i] as { state: Json; data: Json; component?: { initialData?: Json } }
                expect(actual.state).toEqual(f.state)
                expect(actual.data).toEqual(f.data)
                if (f.initialData) expect(actual.component?.initialData).toEqual(f.initialData)
            })
        })
    }

    for (const s of corpus.syncPaths) {
        it(`sync path of '${s.route}' is '${s.expected}'`, () => expect(toSyncPath(s.route)).toBe(s.expected))
    }
})
