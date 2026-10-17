// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

// A stand-in grid that keeps what the tree hands it (dataProvider, expandedItems) and counts
// cache clears; stand-in columns keep their cell renderer so a test can paint a cell.
vi.hoisted(() => {
    class FakeGrid extends HTMLElement {
        clears = 0
        clearCache() { this.clears++ }
        requestContentUpdate() {}
    }
    for (const tag of ['vaadin-grid-column', 'vaadin-grid-tree-column']) {
        if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
    if (!customElements.get('vaadin-grid')) customElements.define('vaadin-grid', FakeGrid)
})

import './mateu-vaadin-tree'
import type { MateuVaadinTree } from './mateu-vaadin-tree'

type Grid = HTMLElement & { dataProvider: any, expandedItems: any[], clears: number, itemHasChildrenPath: string }
type Col = HTMLElement & { renderer: (root: HTMLElement, column: unknown, model: unknown) => void }

/**
 * The tree layout of a crud (a tree lookup dialog): every group starts expanded, leaves carry no
 * caret (vaadin-grid reads an empty `children` array as "has children"), the Select cell picks the
 * row (`action-on-row-select`), the View cell opens it, and rows arriving later reach the grid.
 */
const ROWS = [
    { id: 'eu', name: 'Europe', children: [{ id: 'es', name: 'Spain', children: [] }, { id: 'fr', name: 'France', children: [], viewable: false }] },
    { id: 'as', name: 'Asia', children: [] },
]

const mount = async (props: Partial<MateuVaadinTree> = {}) => {
    const t = document.createElement('mateu-vaadin-tree') as MateuVaadinTree
    Object.assign(t, { rows: ROWS, columns: [{ id: 'name', label: 'Zone' }, { id: 'select', label: '' }], ...props })
    const actions: any[] = []
    t.addEventListener('action-requested', (e) => actions.push((e as CustomEvent).detail))
    document.body.appendChild(t)
    await t.updateComplete
    const grid = t.shadowRoot!.querySelector('vaadin-grid') as unknown as Grid
    const fetch = (parentItem?: any) => {
        let got: any[] = []
        grid.dataProvider({ parentItem }, (items: any[]) => { got = items })
        return got
    }
    const paint = (col: Col, item: any) => {
        const root = document.createElement('div')
        col.renderer(root, col, { item })
        return root
    }
    return { t, grid, actions, fetch, paint, cols: () => Array.from(t.shadowRoot!.querySelectorAll('vaadin-grid > *')) as Col[] }
}

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-vaadin-tree', () => {
    it('serves the roots, then each group\'s children; leaves have no children to expand', async () => {
        const { grid, fetch } = await mount()
        expect(grid.itemHasChildrenPath).toBe('children')
        const roots = fetch()
        expect(roots.map(r => r.name)).toEqual(['Europe', 'Asia'])
        expect(roots[1].children).toBeUndefined()
        expect(fetch(roots[0]).map(r => r.name)).toEqual(['Spain', 'France'])
        expect(fetch(roots[0])[0].children).toBeUndefined()
    })

    it('every group starts expanded; a collapse by the user sticks', async () => {
        const { t, grid } = await mount()
        expect(grid.expandedItems.map(r => r.name)).toEqual(['Europe'])
        grid.dispatchEvent(new CustomEvent('expanded-items-changed', { detail: { value: [] } }))
        await t.updateComplete
        expect(grid.expandedItems).toEqual([])
    })

    it('the first column is the tree column; Select picks the row', async () => {
        const { cols, paint, actions } = await mount()
        const [tree, select] = cols()
        expect(tree.localName).toBe('vaadin-grid-tree-column')
        expect(tree.getAttribute('header')).toBe('Zone')
        ;(paint(select, ROWS[1]).querySelector('vaadin-button') as HTMLElement).click()
        expect(actions).toEqual([{ actionId: 'action-on-row-select', parameters: { _clickedRow: ROWS[1] } }])
    })

    it('other columns are plain path columns', async () => {
        const { cols } = await mount({ columns: [{ id: 'name' }, { id: 'code', label: 'Code' }] })
        expect(cols()[1].getAttribute('path')).toBe('code')
    })

    it('a navigable tree has a View cell, except on rows flagged not viewable', async () => {
        const { cols, paint, actions } = await mount({ navigable: true })
        const view = cols().pop()!
        ;(paint(view, ROWS[1]).querySelector('vaadin-button') as HTMLElement).click()
        expect(actions).toEqual([{ actionId: 'view', parameters: ROWS[1] }])
        expect(paint(view, { viewable: false }).querySelector('vaadin-button')).toBeNull()
    })

    it('rows arriving later make the grid refetch, and their groups expand', async () => {
        const { t, grid, fetch } = await mount({ rows: [] })
        const before = grid.clears
        t.rows = ROWS as never
        await t.updateComplete
        expect(grid.clears).toBeGreaterThan(before)
        expect(fetch().map(r => r.name)).toEqual(['Europe', 'Asia'])
        expect(grid.expandedItems.map(r => r.name)).toEqual(['Europe'])
    })

    it('no columns: no tree column at all', async () => {
        const { cols } = await mount({ columns: [] })
        expect(cols()).toEqual([])
    })
})
