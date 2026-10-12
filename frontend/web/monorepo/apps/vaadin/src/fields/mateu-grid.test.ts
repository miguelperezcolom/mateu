// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

// vaadin-grid needs a real layout; a stand-in exposes what mateu-grid uses of it (getEventContext,
// generateCellPartNames) so the row-selection contract can be driven in jsdom.
vi.hoisted(() => {
    class FakeGrid extends HTMLElement {
        items: unknown[] = []
        nextItem: unknown
        getEventContext() { return { item: this.nextItem } }
        generateCellPartNames() {}
        requestContentUpdate() {}
    }
    for (const tag of ['vaadin-grid-column', 'vaadin-grid-sort-column', 'vaadin-grid-filter-column', 'vaadin-grid-selection-column']) {
        if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
    if (!customElements.get('vaadin-grid')) customElements.define('vaadin-grid', FakeGrid)
})

import './mateu-grid'
import type { MateuGrid } from './mateu-grid'

/**
 * @OnRowSelected: a click on a row (even on a READ-ONLY grid — the master/detail idiom) runs the
 * developer's method with the row as `_clickedRow`; a click on an in-row control does not; and
 * `shortcut = "ctrl+shift"` selects row N with Ctrl+Shift+N (by physical key, keypad included),
 * but not while the user is typing in a field elsewhere.
 */
describe('mateu-grid row selection', () => {
    const ROWS = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Alan' }, { id: 3, name: 'Grace' }]

    const mount = async (field: Record<string, unknown> = {}) => {
        const g = document.createElement('mateu-grid') as MateuGrid
        g.id = 'guests'
        g.field = { fieldId: 'guests', dataType: 'array', stereotype: 'grid', columns: [],
            onItemSelectionActionId: 'onGuestSelected', readOnly: true, ...field } as never
        g.state = { guests: ROWS }
        g.data = {}
        // jsdom has no layout: make the grid count as on screen for the shortcut's visibility check
        g.getClientRects = () => [{}] as unknown as DOMRectList
        const actions: any[] = []
        g.addEventListener('action-requested', (e) => actions.push((e as CustomEvent).detail))
        document.body.appendChild(g)
        await g.updateComplete
        return { g, actions, grid: g.shadowRoot!.querySelector('vaadin-grid') as unknown as HTMLElement & { nextItem: unknown } }
    }
    const key = (init: KeyboardEventInit) => document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))

    afterEach(() => { document.body.innerHTML = '' })

    it('a clickable grid says so (pointer cursor, clickable attribute)', async () => {
        const { grid } = await mount()
        expect(grid.hasAttribute('clickable')).toBe(true)
        expect(grid.getAttribute('style')).toContain('cursor: pointer;')
    })

    it('a row click runs the @OnRowSelected action with the row, and marks it selected', async () => {
        const { g, grid, actions } = await mount()
        grid.nextItem = ROWS[1]
        grid.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
        expect(actions).toEqual([{ actionId: 'onGuestSelected', parameters: { _clickedRow: ROWS[1] } }])
        expect(g.state['guests_selected_items']).toEqual([ROWS[1]])
    })

    it('a click on an in-row control (a button) does not also select the row', async () => {
        const { grid, actions } = await mount()
        grid.nextItem = ROWS[0]
        const button = document.createElement('vaadin-button')
        grid.appendChild(button)
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
        expect(actions).toEqual([])
    })

    it('a click outside any row selects nothing', async () => {
        const { grid, actions } = await mount()
        grid.nextItem = undefined
        grid.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
        expect(actions).toEqual([])
    })

    it('Ctrl+Shift+N selects the N-th row, by physical key and from the numeric keypad', async () => {
        const { actions } = await mount({ rowSelectionShortcut: 'ctrl+shift' })
        key({ key: '"', code: 'Digit2', ctrlKey: true, shiftKey: true })
        key({ key: '3', code: 'Numpad3', ctrlKey: true, shiftKey: true })
        expect(actions.map(a => a.parameters._clickedRow.name)).toEqual(['Alan', 'Grace'])
    })

    it('the shortcut ignores missing rows, other modifiers and grids without one', async () => {
        const { actions } = await mount({ rowSelectionShortcut: 'ctrl+shift' })
        key({ code: 'Digit9', ctrlKey: true, shiftKey: true })
        key({ code: 'Digit1', ctrlKey: true })
        expect(actions).toEqual([])
        document.body.innerHTML = ''
        const plain = await mount()
        key({ code: 'Digit1', ctrlKey: true, shiftKey: true })
        expect(plain.actions).toEqual([])
    })

    it('the shortcut does not fire while the user types in a field elsewhere', async () => {
        const { actions } = await mount({ rowSelectionShortcut: 'ctrl+shift' })
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()
        key({ code: 'Digit1', ctrlKey: true, shiftKey: true })
        expect(actions).toEqual([])
    })

    it('an unmounted grid stops listening', async () => {
        const { g, actions } = await mount({ rowSelectionShortcut: 'ctrl+shift' })
        g.remove()
        key({ code: 'Digit1', ctrlKey: true, shiftKey: true })
        expect(actions).toEqual([])
    })
})
