// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { insideIsland } from './embeddedChrome'

/**
 * An island (an `EmbeddedView` — a server-side component nested in another one's tree) is a block
 * of the host page: a composed archetype embedded like that must not draw the WINDOW title as its
 * heading (the Mateu Explorer's dashboard entry showed "Mateu Explorer" above the dashboard).
 */
describe('insideIsland', () => {
    const tree = () => {
        const ux = document.createElement('mateu-ux')
        const page = document.createElement('mateu-component')
        ux.appendChild(page)
        const shadow = page.attachShadow({ mode: 'open' })
        const layout = document.createElement('div')
        shadow.appendChild(layout)
        const island = document.createElement('mateu-component')
        layout.appendChild(island)
        const inner = document.createElement('div')
        island.attachShadow({ mode: 'open' }).appendChild(inner)
        return { ux, page, island, inner }
    }

    it('a page right under its mateu-ux is not an island', () => {
        expect(insideIsland(tree().page)).toBe(false)
    })

    it('a component nested in another one, across shadow roots, is — and so is what it holds', () => {
        const { island, inner } = tree()
        expect(insideIsland(island)).toBe(true)
        expect(insideIsland(inner)).toBe(true)
    })

    it('a nested mateu-ux starts a page of its own (a micro frontend, an embedded mediator)', () => {
        const { island } = tree()
        const ux = document.createElement('mateu-ux')
        const page = document.createElement('mateu-component')
        ux.appendChild(page)
        island.shadowRoot!.appendChild(ux)
        expect(insideIsland(page)).toBe(false)
    })
})
