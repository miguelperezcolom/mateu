// Phase 6 increment 2 — specs mode: a definition-only route is expanded to the wire IN THE BROWSER
// (no pre-render, no backend) when the manifest ships the raw definition. Covers getExpandedIncrement
// and that hasBundle() turns on for a definitions-only manifest. The mechanical expansion itself is
// pinned in expandDefinition.test.ts against a server golden; here we test the store wiring.
import { describe, expect, it, beforeEach } from 'vitest'
import {
    __setBundleForTests,
    getExpandedIncrement,
    hasBundle,
} from '@infra/http/bundleStore.ts'
import type { DefinitionSpec } from '@infra/expander/expandDefinition.ts'

const aboutSpec: DefinitionSpec = {
    layout: { type: 'VerticalLayout', content: [{ type: 'Text', text: 'About this app' }] },
}

beforeEach(() => __setBundleForTests(undefined))

describe('bundle specs mode — client-side definition expansion (Phase 6, increment 2)', () => {
    it('a definitions-only manifest counts as a loaded bundle', () => {
        expect(hasBundle()).toBe(false)
        __setBundleForTests(undefined, [], [{ route: 'about', definition: 'about.yaml' }], { 'about.yaml': aboutSpec })
        expect(hasBundle()).toBe(true)
    })

    it('expands a definition-only route to a wire increment', () => {
        __setBundleForTests(undefined, [], [{ route: 'about', definition: 'about.yaml' }], { 'about.yaml': aboutSpec })
        const inc = getExpandedIncrement('about')
        expect(inc).toBeDefined()
        const c = inc!.fragments![0].component as any
        expect(c.metadata.type).toBe('VerticalLayout')
        expect(c.children[0].metadata).toMatchObject({ type: 'Text', text: 'About this app' })
        expect(inc!.commands![0]).toMatchObject({ type: 'SetWindowTitle', data: 'About' })
    })

    it('applies the route registry params to the expanded increment', () => {
        __setBundleForTests(
            undefined, [],
            [{ route: 'about', definition: 'about.yaml', fixedParams: { tenant: 'acme' } }],
            { 'about.yaml': aboutSpec },
        )
        const f = getExpandedIncrement('about')!.fragments![0]
        expect((f.state as any)?.tenant).toBe('acme')
    })

    it('skips a route with no definition, an unknown definition, or a viewModel (needs a backend)', () => {
        __setBundleForTests(
            undefined, [],
            [
                { route: 'plain', viewModel: 'io.example.Plain', definition: 'plain.yaml' },
                { route: 'bare' },
                { route: 'missing', definition: 'nope.yaml' },
            ],
            { 'plain.yaml': { layout: aboutSpec.layout, viewModel: 'io.example.Plain' } },
        )
        expect(getExpandedIncrement('plain')).toBeUndefined()   // viewModel → backend
        expect(getExpandedIncrement('bare')).toBeUndefined()    // no definition
        expect(getExpandedIncrement('missing')).toBeUndefined() // definition not shipped
    })

    it('never expands what depends on who asks: a route with access:, or a definition with access keys', () => {
        const guarded: DefinitionSpec = {
            layout: { type: 'VerticalLayout', content: [
                { type: 'Text', text: 'Public' },
                { type: 'Text', text: 'Salaries', eyesOnly: { roles: ['hr'] } } as any,
            ] },
        }
        __setBundleForTests(
            undefined, [],
            [
                // a public route and a restricted one sharing a definition: the public one expands
                { route: 'about', definition: 'about.yaml' },
                { route: 'about-admin', definition: 'about.yaml', access: { roles: ['admin'] } },
                // a definition carrying access keys (a manifest built before they were withheld)
                { route: 'salaries', definition: 'salaries.yaml' },
                // an empty restriction lets everybody through
                { route: 'open', definition: 'about.yaml', access: { roles: [] } },
            ],
            { 'about.yaml': aboutSpec, 'salaries.yaml': guarded },
        )
        expect(getExpandedIncrement('about')).toBeDefined()
        expect(getExpandedIncrement('about-admin')).toBeUndefined()
        expect(getExpandedIncrement('salaries')).toBeUndefined()
        expect(getExpandedIncrement('open')).toBeDefined()
    })
})
