// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-ux'
import { appState } from '@domain/state'

// An EMBEDDED ux (a micro frontend) is handed only the island's declared appState, while its own
// answers — a route's `appState:` seed — land in the app's store. Its content read `${appState.x}`
// from the declared one only, so the seed rendered empty (Explorer: route scopes, beta.51).

afterEach(() => {
    appState.value = {}
    document.body.innerHTML = ''
})

const ux = (own?: Record<string, unknown>) => {
    const element = document.createElement('mateu-ux') as any
    element.appState = own
    return element
}

describe('mateu-ux effective app state', () => {
    it('an embedded ux reads what its answers put in the app store', () => {
        appState.value = { explorerTheme: 'Seeded by the route' }
        expect(ux(undefined).effectiveAppState()).toEqual({ explorerTheme: 'Seeded by the route' })
    })

    it("the island's declared values win over the store", () => {
        appState.value = { a: 'store', b: 'store' }
        expect(ux({ b: 'island' }).effectiveAppState()).toEqual({ a: 'store', b: 'island' })
    })

    it('the top-level ux, handed the store itself, gets it as it is', () => {
        appState.value = { a: 1 }
        expect(ux(appState.value).effectiveAppState()).toBe(appState.value)
    })

    it('the merge is the same object while nothing changed (no re-render churn)', () => {
        appState.value = { a: 1 }
        const element = ux({ b: 2 })
        expect(element.effectiveAppState()).toBe(element.effectiveAppState())
    })
})
