// The mount's authored route registry, shipped in the manifest and applied client-side.
//
// A statically deployed mount has no server to ask what a URL means, so the parameters a route pins
// or seeds travel as data and are applied here. The precedence must match the server's, or the same
// route would behave differently depending on whether a backend happens to be present:
//
//   fixed  >  path  >  what the increment already carries  >  defaults
import { describe, expect, it, beforeEach } from 'vitest'
import {
    __setBundleForTests,
    applyRouteParams,
    getBundledIncrement,
    getRouteEntry,
    matchBundledTemplate,
} from './bundleStore'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'

const incrementWith = (state: Record<string, unknown>): UIIncrement =>
    ({ fragments: [{ state, data: {} }] }) as unknown as UIIncrement

const stateOf = (increment: UIIncrement | undefined) =>
    (increment?.fragments?.[0] as { state?: Record<string, unknown> } | undefined)?.state ?? {}

describe('shipped route registry', () => {
    beforeEach(() => __setBundleForTests(undefined, [], []))

    it('leaves an increment untouched when no entry answers the path', () => {
        __setBundleForTests(undefined, [], [{ route: 'orders' }])
        const increment = incrementWith({ a: 1 })
        expect(applyRouteParams('customers', increment)).toBe(increment)
    })

    it('applies a pinned parameter over what the increment already carries', () => {
        __setBundleForTests(undefined, [], [
            { route: 'tickets/open', fixedParams: { status: 'open' } },
        ])
        expect(stateOf(applyRouteParams('tickets/open', incrementWith({ status: 'all' }))))
            .toMatchObject({ status: 'open' })
    })

    it('lets a seeded default yield to what the increment carries', () => {
        __setBundleForTests(undefined, [], [
            { route: 'tickets', defaultParams: { status: 'open', page: 1 } },
        ])
        const state = stateOf(applyRouteParams('tickets', incrementWith({ status: 'closed' })))
        expect(state.status).toBe('closed') // already chosen
        expect(state.page).toBe(1) // nobody supplied it, so the default stands
    })

    it('reads path params off a parameterised route', () => {
        __setBundleForTests(undefined, [], [{ route: 'orders/:id' }])
        expect(stateOf(applyRouteParams('orders/42', incrementWith({})))).toMatchObject({ id: '42' })
    })

    it('lets a pinned parameter outrank a path parameter of the same name', () => {
        __setBundleForTests(undefined, [], [
            { route: 'tickets/:status', fixedParams: { status: 'open' } },
        ])
        expect(stateOf(applyRouteParams('tickets/all', incrementWith({}))))
            .toMatchObject({ status: 'open' })
    })

    it('does not let a parameterised route swallow its static sibling', () => {
        // `orders/:id` is declared FIRST on purpose: matching must not depend on order.
        __setBundleForTests(undefined, [], [
            { route: 'orders/:id', viewModel: 'Detail' },
            { route: 'orders/new', viewModel: 'New' },
        ])
        expect(getRouteEntry('orders/new')?.viewModel).toBe('New')
        expect(getRouteEntry('orders/42')?.viewModel).toBe('Detail')
    })

    it('resolves the root of the mount', () => {
        __setBundleForTests(undefined, [], [{ route: '', viewModel: 'Home' }])
        expect(getRouteEntry('_no_route')?.viewModel).toBe('Home')
    })

    it('applies the registry when answering a bundled route', () => {
        __setBundleForTests(
            new Map([['tickets/open', incrementWith({ status: 'all' })]]),
            [],
            [{ route: 'tickets/open', fixedParams: { status: 'open' } }],
        )
        expect(stateOf(getBundledIncrement('tickets/open'))).toMatchObject({ status: 'open' })
    })

    it('applies the registry on top of a template match, so a pin still outranks the path', () => {
        __setBundleForTests(
            undefined,
            [{ regex: /^tickets\/([^/]+)$/, paramNames: ['status'], increment: incrementWith({}) }],
            [{ route: 'tickets/:status', fixedParams: { status: 'open' } }],
        )
        expect(stateOf(matchBundledTemplate('tickets/all'))).toMatchObject({ status: 'open' })
    })

    it('exposes the entry so a caller can reach its definition', () => {
        __setBundleForTests(undefined, [], [{ route: 'about', definition: 'about.yaml' }])
        expect(getRouteEntry('about')?.definition).toBe('about.yaml')
        expect(getRouteEntry('about')?.viewModel).toBeUndefined()
    })
})
