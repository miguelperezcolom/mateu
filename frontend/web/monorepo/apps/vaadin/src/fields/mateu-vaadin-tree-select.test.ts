// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
    for (const tag of ['vaadin-grid', 'vaadin-grid-tree-column']) {
        if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
})

import './mateu-vaadin-tree-select'
import type { MateuVaadinTreeSelect } from './mateu-vaadin-tree-select'

type Grid = HTMLElement & { dataProvider: any, expandedItems: any[], activeItem: unknown }

/**
 * @TreeSelect on the Vaadin renderer: the control shows the picked option's LABEL (looked up in the
 * whole tree), opening it expands the path to the current value, a pick commits through the
 * standard `value-changed`, Clear commits undefined, and with `leavesOnly` a group only expands.
 */
const OPTIONS = [
    { value: 'eu', label: 'Europe', children: [{ value: 'es', label: 'Spain', children: [] }, { value: 'fr', label: 'France' }] },
    { value: 'as', label: 'Asia', children: [] },
]

const mount = async (props: Partial<MateuVaadinTreeSelect> = {}) => {
    const s = document.createElement('mateu-vaadin-tree-select') as MateuVaadinTreeSelect
    Object.assign(s, { fieldId: 'zone', options: OPTIONS, ...props })
    const changes: any[] = []
    s.addEventListener('value-changed', (e) => changes.push((e as CustomEvent).detail))
    document.body.appendChild(s)
    await s.updateComplete
    const $ = (sel: string) => s.shadowRoot!.querySelector(sel) as HTMLElement
    const open = async () => { $('.control').click(); await s.updateComplete; return $('vaadin-grid') as unknown as Grid }
    return { s, $, open, changes }
}

const activate = (grid: Grid, item: unknown) =>
    grid.dispatchEvent(new CustomEvent('active-item-changed', { detail: { value: item } }))

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-vaadin-tree-select', () => {
    it('shows the label of a nested value; an unknown value shows itself; none shows a dash', async () => {
        expect((await mount({ value: 'es' })).$('.control').textContent).toContain('Spain')
        expect((await mount({ value: 'zz' })).$('.control').textContent).toContain('zz')
        const empty = await mount()
        expect(empty.$('.control span').className).toBe('placeholder')
        expect(empty.$('.control').textContent).toContain('—')
    })

    it('opening expands the path to the current value and serves the tree level by level', async () => {
        const { open } = await mount({ value: 'es' })
        const grid = await open()
        expect(grid.expandedItems.map(o => o.label)).toEqual(['Europe'])
        let roots: any[] = []
        grid.dataProvider({}, (items: any[]) => { roots = items })
        expect(roots.map(o => o.label)).toEqual(['Europe', 'Asia'])
        expect(roots[1].children).toBeUndefined()
        let kids: any[] = []
        grid.dataProvider({ parentItem: roots[0] }, (items: any[]) => { kids = items })
        expect(kids.map(o => o.label)).toEqual(['Spain', 'France'])
    })

    it('a pick commits the value and closes; the control toggles the panel', async () => {
        const { s, $, open, changes } = await mount()
        const grid = await open()
        activate(grid, { value: 'as', label: 'Asia' })
        await s.updateComplete
        expect(changes).toEqual([{ value: 'as', fieldId: 'zone' }])
        expect($('.panel')).toBeNull()
        await open()
        $('.control').click()
        await s.updateComplete
        expect($('.panel')).toBeNull()
    })

    it('a group can be picked unless leavesOnly, where it only toggles its expansion', async () => {
        const free = await mount()
        activate(await free.open(), OPTIONS[0])
        expect(free.changes.map(c => c.value)).toEqual(['eu'])

        const leaves = await mount({ leavesOnly: true })
        const grid = await leaves.open()
        let roots: any[] = []
        grid.dataProvider({}, (items: any[]) => { roots = items })
        activate(grid, roots[0])
        await leaves.s.updateComplete
        expect(leaves.changes).toEqual([])
        expect(grid.expandedItems).toEqual([roots[0]])
        expect(grid.activeItem).toBeNull()
        activate(grid, roots[0])
        await leaves.s.updateComplete
        expect(grid.expandedItems).toEqual([])
        activate(grid, null)
        expect(leaves.changes).toEqual([])
    })

    it('Clear commits no value', async () => {
        const { s, $, open, changes } = await mount({ value: 'es' })
        await open()
        ;($('.clear-row vaadin-button')).click()
        await s.updateComplete
        expect(changes).toEqual([{ value: undefined, fieldId: 'zone' }])
    })

    it('a click outside closes the panel; one inside does not', async () => {
        const { s, $, open } = await mount()
        await open()
        s.shadowRoot!.querySelector('.panel')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }))
        await s.updateComplete
        expect($('.panel')).not.toBeNull()
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        await s.updateComplete
        expect($('.panel')).toBeNull()
    })

    it('the user\'s expand/collapse in the grid is kept', async () => {
        const { s, open } = await mount()
        const grid = await open()
        grid.dispatchEvent(new CustomEvent('expanded-items-changed', { detail: { value: [OPTIONS[0]] } }))
        await s.updateComplete
        expect(grid.expandedItems).toEqual([OPTIONS[0]])
    })
})
