// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { html, LitElement, render } from 'lit'

vi.mock('@infra/ui/renderers/renderComponent.ts', () => ({
    renderComponent: (_c: unknown, comp: { id?: string }) => html`<i data-child="${comp?.id}"></i>`,
}))

import { renderResponsiveGrid } from './responsiveGridRenderer'

const grid = (metadata: Record<string, unknown>, children: Record<string, unknown>[] = []) =>
    ({ type: 'ClientSide', id: 'g', metadata: { type: 'ResponsiveGrid', ...metadata }, children: children.map(c => ({ type: 'ClientSide', metadata: {}, ...c })) }) as any

let container: LitElement & { requestUpdate: ReturnType<typeof vi.fn> }
let host: HTMLElement
const draw = (component: any) => {
    container = { requestUpdate: vi.fn(() => draw(component)) } as any
    host ??= document.body.appendChild(document.createElement('div'))
    render(renderResponsiveGrid(container, component, undefined, {}, {}, {}, {}), host)
    return host
}
afterEach(() => { document.body.innerHTML = ''; host = undefined as any; localStorage.clear() })
const childOrder = () => [...host.querySelectorAll('[data-child]')].map(c => c.getAttribute('data-child'))

describe('responsive grid', () => {
    it('falls back to a responsive auto-fit and spans children by colSpans', () => {
        draw(grid({ colSpans: [2, 1] }, [{ id: 'a' }, { id: 'b' }]))
        const g = host.querySelector('.mateu-responsive-grid')!
        expect(g.getAttribute('style')).toContain('repeat(auto-fit')
        expect(host.querySelector('[data-child="a"]')!.parentElement!.getAttribute('style')).toContain('span 2')
        expect(host.querySelector('.mateu-responsive-grid-container')).toBeNull()
    })

    it('uses declared tracks and gap', () => {
        draw(grid({ gridTemplateColumns: 'auto 1fr', gap: '2rem' }, [{ id: 'a' }]))
        const style = host.querySelector('.mateu-responsive-grid')!.getAttribute('style')!
        expect(style).toContain('grid-template-columns: auto 1fr')
        expect(style).toContain('gap: 2rem')
    })

    it('places slotted children in named areas, pinning the sticky ones; unslotted ones flow', () => {
        draw(grid({ gridTemplateAreas: '"list detail"', stickyAreas: ['detail'] }, [{ id: 'l', slot: 'list' }, { id: 'd', slot: 'detail' }, { id: 'x' }]))
        const style = host.querySelector('.mateu-responsive-grid')!.getAttribute('style')!
        expect(style).toContain('grid-template-areas: "list detail"')
        expect(style).not.toContain('grid-template-columns')
        expect(host.querySelector('[data-child="l"]')!.parentElement!.getAttribute('style')).toBe('grid-area: list; min-width: 0;')
        expect(host.querySelector('[data-child="d"]')!.parentElement!.getAttribute('style')).toContain('position: sticky')
        expect(host.querySelector('[data-child="x"]')).toBeTruthy()
    })

    it('stacks below its container width with a rule scoped to this grid', () => {
        draw(grid({ gridTemplateColumns: '1fr 1fr', stackBelow: '40rem' }, [{ id: 'a' }]))
        expect(host.querySelector('style')!.textContent).toContain('@container (max-width: 40rem)')
        expect(host.querySelector('style')!.textContent).toContain('[data-grid-id="g"]')
        expect(host.querySelector('.mateu-responsive-grid')!.getAttribute('data-grid-id')).toBe('g')
    })

    describe('reorderable tiles', () => {
        const tiles = () => grid({ reorderable: true }, [{ id: 'a' }, { id: 'b' }, { id: 'c' }])
        const tile = (key: string) => host.querySelector(`[data-tile-key="${key}"]`) as HTMLElement
        const dt = (data: Record<string, string> = {}) => {
            const store: Record<string, string> = { ...data }
            return { types: Object.keys(store), effectAllowed: '', setData(t: string, v: string) { store[t] = v; (this as any).types = Object.keys(store) }, getData: (t: string) => store[t] ?? '' }
        }
        const drag = (type: string, target: HTMLElement, dataTransfer: any) => {
            const e = new Event(type, { bubbles: true, cancelable: true }) as any
            e.dataTransfer = dataTransfer
            target.dispatchEvent(e)
            return e as Event
        }

        it('wraps each child in a focusable draggable tile', () => {
            draw(tiles())
            const all = [...host.querySelectorAll('.mateu-tile')]
            expect(all.map(t => t.getAttribute('draggable'))).toEqual(['true', 'true', 'true'])
            expect(all.every(t => t.getAttribute('tabindex') === '0')).toBe(true)
            expect(childOrder()).toEqual(['a', 'b', 'c'])
        })

        it('dropping a tile on another moves it there and remembers the order', () => {
            draw(tiles())
            const first = container
            const transfer = dt()
            drag('dragstart', tile('c'), transfer)
            expect(transfer.effectAllowed).toBe('move')
            const over = drag('dragover', tile('a'), transfer)
            expect(over.defaultPrevented).toBe(true)
            drag('drop', tile('a'), transfer)
            expect(first.requestUpdate).toHaveBeenCalled()
            expect(childOrder()).toEqual(['c', 'a', 'b'])
            // a fresh render reads the saved order
            host.innerHTML = ''; host = undefined as any
            draw(tiles())
            expect(childOrder()).toEqual(['c', 'a', 'b'])
        })

        it('ignores drops of foreign data or from another grid', () => {
            draw(tiles())
            const foreign = drag('dragover', tile('a'), dt({ 'text/plain': 'x' }))
            expect(foreign.defaultPrevented).toBe(false)
            drag('drop', tile('a'), dt({ 'application/x-mateu-tile': '/other#g\nc' }))
            expect(childOrder()).toEqual(['a', 'b', 'c'])
        })

        it('Alt+arrows move a focused tile one place', () => {
            draw(tiles())
            tile('a').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }))
            expect(childOrder()).toEqual(['b', 'a', 'c'])
            tile('a').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }))
            expect(childOrder()).toEqual(['a', 'b', 'c'])
            // without Alt the arrows are not ours
            tile('a').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
            expect(childOrder()).toEqual(['a', 'b', 'c'])
        })
    })
})
