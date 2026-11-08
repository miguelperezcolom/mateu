// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { ISLAND_HOST_STYLE } from './islandHost'
import { islandDataOf } from './renderers/renderComponent'

/**
 * An island (an EmbeddedView, a MicroFrontend) behaves as the same view on a page of its own
 * (found building the Mateu Explorer, 3.0-beta.51): it takes the width of its container, and a
 * lookup in it shows its label, which travels in the island's own data.
 */
describe('island host', () => {
    it('is a block that stretches to its container and may shrink inside a row', () => {
        const text = ISLAND_HOST_STYLE.cssText.replace(/\s+/g, ' ')
        expect(text).toContain('display: block')
        expect(text).toContain('align-self: stretch')
        expect(text).toContain('min-width: 0')
    })

    it('mateu-component and mateu-api-caller — what an island is drawn in — carry it', async () => {
        const { MateuApiCaller } = await import('./mateu-api-caller')
        const { MateuComponent } = await import('./mateu-component')
        for (const element of [MateuApiCaller, MateuComponent]) {
            const styles = [(element as unknown as { styles: unknown }).styles].flat(Infinity)
            expect(styles).toContain(ISLAND_HOST_STYLE)
        }
    })
})

describe('island data', () => {
    it('an island renders with the host data and its OWN on top (a lookup label)', () => {
        const island = { type: 'ServerSide', data: { 'guestId-label': 'Alan Turing' } }
        expect(islandDataOf(island as never, { other: 1, 'guestId-label': 'stale' })).toEqual({ other: 1, 'guestId-label': 'Alan Turing' })
    })

    it('a component without data of its own renders with the host data', () => {
        const data = { a: 1 }
        const shown = islandDataOf({ type: 'ServerSide' } as never, data)
        expect(shown).toEqual({ a: 1 })
        expect(shown).not.toBe(data)
    })
})
