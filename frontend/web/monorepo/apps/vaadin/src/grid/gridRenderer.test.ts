// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
    class FakeGrid extends HTMLElement {
        getEventContext() { return {} }
        recalculateColumnWidths() {}
        requestContentUpdate() {}
        clearCache() {}
    }
    for (const tag of ['vaadin-grid-column', 'vaadin-grid-sort-column', 'vaadin-grid-filter-column', 'vaadin-grid-tree-column',
        'vaadin-grid-selection-column', 'vaadin-grid-column-group', 'vaadin-tooltip']) {
        if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
    if (!customElements.get('vaadin-grid')) customElements.define('vaadin-grid', FakeGrid)
})

import { render } from 'lit'
import type { LitElement } from 'lit'
import { renderGrid } from './gridRenderer'
import { renderCrudTable, renderTableElement } from './renderTable'
import type { MateuTable } from './mateu-table'

/**
 * The client-side Grid component (fluent `Grid`: plain rows, or a TREE of rows carrying `children`)
 * and the two entry points to <mateu-table> (a standalone Table component, and a crud listing's
 * table): what reaches the grid element, so a wire Grid/Table shows its rows.
 */
const columns = [
    { id: 'name', type: 'ClientSide', metadata: { type: 'GridColumn', id: 'name', label: 'Name' } },
    { id: 'size', type: 'ClientSide', metadata: { type: 'GridColumn', id: 'size', label: 'Size', autoWidth: true, width: '6rem' } },
]

const paint = (template: unknown) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    render(template, host)
    return host
}

afterEach(() => { document.body.innerHTML = '' })

describe('renderGrid', () => {
    it('plain rows: the page content, or the rows the component state carries', () => {
        const comp = { id: 'files', type: 'ClientSide', metadata: { type: 'Grid', content: columns, page: { content: [{ name: 'a' }] } }, style: 'height: 10rem' }
        const grid = paint(renderGrid({} as LitElement, comp as never, '', {}, {}, {}, {})).querySelector('vaadin-grid') as HTMLElement & { items: any[] }
        expect(grid.items).toEqual([{ name: 'a' }])
        expect(grid.getAttribute('style')).toBe('height: 10rem')
        expect(grid.querySelectorAll('vaadin-grid-column')).toHaveLength(2)
        const fromState = paint(renderGrid({} as LitElement, comp as never, '', { files: [{ name: 'b' }] }, {}, {}, {})).querySelector('vaadin-grid') as HTMLElement & { items: any[] }
        expect(fromState.items).toEqual([{ name: 'b' }])
    })

    it('no rows anywhere: an empty grid, not an error', () => {
        const comp = { type: 'ClientSide', metadata: { type: 'Grid', content: columns } }
        const grid = paint(renderGrid({} as LitElement, comp as never, '', {}, {}, {}, {})).querySelector('vaadin-grid') as HTMLElement & { items: any[] }
        expect(grid.items).toEqual([])
    })

    it('a tree: the first column expands, the rest paint cells; each level serves its own rows', async () => {
        const rows = [{ name: 'src', size: 2, children: [{ name: 'a.ts', size: 1 }] }]
        const comp = { type: 'ClientSide', metadata: { type: 'Grid', tree: true, content: columns, page: { content: rows } } }
        const host = paint(renderGrid({} as LitElement, comp as never, '', {}, {}, {}, {}))
        const grid = host.querySelector('vaadin-grid') as HTMLElement & { dataProvider: any, itemHasChildrenPath: string }
        expect(grid.itemHasChildrenPath).toBe('children')
        const tree = host.querySelector('vaadin-grid-tree-column')!
        expect(tree.getAttribute('path')).toBe('name')
        const size = host.querySelector('vaadin-grid-column') as HTMLElement & { renderer: any }
        expect(size.hasAttribute('auto-width')).toBe(true)
        expect(size.getAttribute('width')).toBe('6rem')
        const answers: any[] = []
        await grid.dataProvider({}, (items: any[], n: number) => answers.push([items.map(i => i.name), n]))
        await grid.dataProvider({ parentItem: rows[0] }, (items: any[], n: number) => answers.push([items.map(i => i.name), n]))
        expect(answers).toEqual([[['src'], 1], [['a.ts'], 1]])
        const cell = document.createElement('div')
        size.dataset.dataType = ''
        size.dataset.stereotype = ''
        size.renderer(cell, Object.assign(size, { path: 'size' }), { item: rows[0] })
        expect(cell.textContent).toContain('2')
        expect(host.querySelector('[slot="empty-state"]')).not.toBeNull()
    })
})

describe('renderTable', () => {
    it('a standalone Table hands the table its metadata, state, data AND app data', async () => {
        const appData = { currency: 'EUR' }
        const comp = { id: 'people', type: 'ClientSide', metadata: { type: 'Table', columns: [] }, children: [] }
        const table = paint(renderTableElement({} as LitElement, comp as never, '/base', { s: 1 }, { d: 1 }, { as: 1 }, appData)).querySelector('mateu-table') as MateuTable
        await table.updateComplete
        expect(table.id).toBe('people')
        expect(table.baseUrl).toBe('/base')
        expect(table.metadata).toBe(comp.metadata)
        expect(table.state).toEqual({ s: 1 })
        expect(table.data).toEqual({ d: 1 })
        expect(table.appState).toEqual({ as: 1 })
        expect(table.appData).toBe(appData)
    })

    it('a crud listing\'s table takes the listing\'s data and its empty-state message, and reports sort/paging to it', async () => {
        const container = Object.assign(document.createElement('div'), {
            id: 'crud', data: { crud: { page: { content: [] } } },
            directionChanged: vi.fn(), fetchMoreElements: vi.fn(),
        })
        const comp = { id: 'listing', type: 'ClientSide', metadata: { type: 'Table', columns: [] } }
        const table = paint(renderCrudTable(container as never, comp as never, '', { listing: { emptyStateMessage: 'Nothing yet' } }, {}, {})).querySelector('mateu-table') as MateuTable
        await table.updateComplete
        expect(table.id).toBe('crud')
        expect(table.data).toBe(container.data)
        expect(table.emptyStateMessage).toBe('Nothing yet')
        table.dispatchEvent(new CustomEvent('sort-direction-changed'))
        table.dispatchEvent(new CustomEvent('fetch-more-elements'))
        expect(container.directionChanged).toHaveBeenCalled()
        expect(container.fetchMoreElements).toHaveBeenCalled()
    })
})
