// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

// vaadin-grid needs a real layout. A stand-in records what mateu-table hands it (items, selection,
// details, part names) and answers getEventContext with whatever the test aims the click at; the
// column stand-ins keep the renderer the directive assigns, so a test can paint a cell itself.
vi.hoisted(() => {
    class FakeGrid extends HTMLElement {
        items: unknown
        ctx: unknown
        interacting = false
        cellPartNameGenerator: unknown = null
        rowDetailsRenderer: unknown
        detailsOpenedItems: unknown[] = []
        selectedItems: unknown[] = []
        recalcs = 0
        getEventContext() { return this.ctx ?? {} }
        recalculateColumnWidths() { this.recalcs++ }
        requestContentUpdate() {}
        clearCache() {}
    }
    for (const tag of ['vaadin-grid-column', 'vaadin-grid-sort-column', 'vaadin-grid-filter-column',
        'vaadin-grid-selection-column', 'vaadin-grid-column-group', 'vaadin-tooltip']) {
        if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
    if (!customElements.get('vaadin-grid')) customElements.define('vaadin-grid', FakeGrid)
})

import './mateu-table'
import type { MateuTable } from './mateu-table'

type FakeGrid = HTMLElement & {
    items: any[], ctx: any, interacting: boolean, cellPartNameGenerator: any, rowDetailsRenderer: any,
    detailsOpenedItems: any[], selectedItems: any[], dataProvider: any, recalcs: number,
}
type Col = HTMLElement & { renderer?: (root: HTMLElement, column: unknown, model: unknown) => void, footerRenderer?: unknown }

const column = (over: Record<string, unknown>) => ({ type: 'ClientSide', metadata: { type: 'GridColumn', ...over } })

const ROWS = [
    { _rowNumber: 0, id: 1, name: 'Ada', status: 'OK' },
    { _rowNumber: 1, id: 2, name: 'Alan', status: 'KO' },
]

const mount = async (metadata: Record<string, unknown>, opts: { rows?: any[], state?: any, data?: any, appState?: any } = {}) => {
    const t = document.createElement('mateu-table') as MateuTable
    t.id = 'people'
    t.metadata = metadata as never
    t.state = opts.state ?? {}
    t.data = opts.data ?? { people: { page: { content: opts.rows ?? ROWS, totalElements: (opts.rows ?? ROWS).length } } }
    t.appState = opts.appState ?? {}
    const events: { type: string, detail: any }[] = []
    for (const type of ['action-requested', 'route-changed', 'navigate-to-requested', 'mateu-selection-changed', 'fetch-more-elements']) {
        t.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
    }
    document.body.appendChild(t)
    await t.updateComplete
    const grid = t.shadowRoot!.querySelector('vaadin-grid') as unknown as FakeGrid
    return { t, grid, events, cols: () => Array.from(t.shadowRoot!.querySelectorAll('vaadin-grid > *')) as Col[] }
}

const click = (grid: FakeGrid, init: MouseEventInit = {}, target?: HTMLElement) => {
    const ev = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, button: 0, ...init })
    ;(target ?? grid).dispatchEvent(ev)
    return ev
}

/** Paints one body cell through the renderer the column directive installed. */
const paint = (col: Col, item: any) => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    // the real column reflects its path attribute to the property the cell renderer reads
    const vaadinColumn = Object.assign(col, { path: col.getAttribute('path') ?? undefined })
    col.renderer!(root, vaadinColumn, { item, index: 0, selected: false, detailsOpened: false, expanded: false, level: 0 })
    return root
}

afterEach(() => {
    document.body.innerHTML = ''
    window.getSelection()?.removeAllRanges()
})

const NAVIGABLE = { columns: [column({ id: 'name', label: 'Name', actionId: 'view' }), column({ id: 'status', label: 'Status' })] }

describe('mateu-table: a click anywhere on a navigable row opens the record', () => {
    it('a body click runs the view action with the row', async () => {
        const { grid, events } = await mount(NAVIGABLE)
        expect(grid.hasAttribute('data-opens-rows')).toBe(true)
        grid.ctx = { item: ROWS[1], section: 'body', column: { path: 'status' } }
        click(grid)
        expect(events.filter(e => e.type === 'action-requested').map(e => e.detail)).toEqual([{ actionId: 'view', parameters: ROWS[1] }])
    })

    it('the opened row is marked as the one shown (selected-row part)', async () => {
        const { t, grid } = await mount({ columns: [column({ id: 'id' }), ...NAVIGABLE.columns] })
        grid.ctx = { item: ROWS[0], section: 'body', column: { path: 'name' } }
        click(grid)
        expect(t.state._selectedId).toBe('1')
        expect(grid.cellPartNameGenerator(null, { item: ROWS[0] })).toBe('selected-row')
        expect(grid.cellPartNameGenerator(null, { item: ROWS[1] })).toBe('')
    })

    it('a rowRoute listing navigates instead (route-changed + navigate-to-requested)', async () => {
        const { grid, events } = await mount({ rowRoute: 'people/${row.id}', columns: [column({ id: 'name' })] })
        grid.ctx = { item: ROWS[1], section: 'body', column: { path: 'name' } }
        click(grid)
        expect(events.filter(e => e.type !== 'action-requested')).toEqual([
            { type: 'route-changed', detail: { route: 'people/2' } },
            { type: 'navigate-to-requested', detail: { route: 'people/2' } },
        ])
    })

    it('modified, non-primary and text-selecting clicks do not open', async () => {
        const { grid, events } = await mount(NAVIGABLE)
        grid.ctx = { item: ROWS[0], section: 'body', column: { path: 'status' } }
        click(grid, { ctrlKey: true })
        click(grid, { metaKey: true })
        click(grid, { shiftKey: true })
        click(grid, { button: 1 })
        const text = document.createElement('p')
        text.textContent = 'copy me'
        document.body.appendChild(text)
        window.getSelection()!.selectAllChildren(text)
        click(grid)
        expect(events.filter(e => e.type === 'action-requested')).toEqual([])
    })

    it('display columns, controls in the cell, header and group rows keep their own click', async () => {
        const { grid, events } = await mount({ columns: [column({ id: 'name', actionId: 'view' }), column({ id: 'edit', dataType: 'action' })] })
        grid.ctx = { item: ROWS[0], section: 'body', column: { path: 'edit' } }
        click(grid)
        const button = document.createElement('vaadin-button')
        grid.appendChild(button)
        grid.ctx = { item: ROWS[0], section: 'body', column: { path: 'name' } }
        click(grid, {}, button)
        grid.ctx = { item: ROWS[0], section: 'header', column: { path: 'name' } }
        click(grid)
        grid.ctx = { item: { __mateuGroup: { value: 'x' }, _rowNumber: 'g' }, section: 'body', column: { path: 'name' } }
        click(grid)
        expect(events.filter(e => e.type === 'action-requested')).toEqual([])
    })

    it('a listing that is not navigable never opens a row', async () => {
        const { grid, events } = await mount({ columns: [column({ id: 'name' })] })
        expect(grid.hasAttribute('data-opens-rows')).toBe(false)
        grid.ctx = { item: ROWS[0], section: 'body', column: { path: 'name' } }
        click(grid)
        expect(events).toEqual([])
    })

    it('rows expanding @Details on click keep that meaning: the click toggles the detail, not the record', async () => {
        const { t, grid, events } = await mount({ ...NAVIGABLE, detailPath: 'detail' })
        expect(grid.hasAttribute('data-clickable-rows')).toBe(true)
        grid.ctx = { item: ROWS[0], section: 'body', column: { path: 'status' } }
        click(grid)
        expect(events.filter(e => e.type === 'action-requested')).toEqual([])
        grid.dispatchEvent(new CustomEvent('active-item-changed', { detail: { value: ROWS[0] } }))
        await t.updateComplete
        expect(grid.detailsOpenedItems).toEqual([ROWS[0]])
        grid.dispatchEvent(new CustomEvent('active-item-changed', { detail: { value: { __mateuGroup: {}, _rowNumber: 'g' } } }))
        await t.updateComplete
        expect(grid.detailsOpenedItems).toEqual([ROWS[0]])
    })

    it('a click on a multi-line row\'s extra line is a click on the row', async () => {
        const { grid, events } = await mount({ columns: [column({ id: 'name', actionId: 'view' }), column({ id: 'status', line: 2 })] })
        const lines = document.createElement('div')
        lines.className = 'row-lines'
        const pair = document.createElement('span')
        pair.dataset.column = 'status'
        lines.appendChild(pair)
        grid.appendChild(lines)
        grid.ctx = { item: ROWS[1], section: 'details' }
        click(grid, {}, pair)
        // details content that is not one of the lines is not the row
        const other = document.createElement('div')
        grid.appendChild(other)
        click(grid, {}, other)
        expect(events.filter(e => e.type === 'action-requested').map(e => e.detail.parameters)).toEqual([ROWS[1]])
    })
})

describe('mateu-table: Enter on a focused row', () => {
    const enter = (grid: FakeGrid, init: KeyboardEventInit = {}) => {
        const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true, ...init })
        grid.dispatchEvent(ev)
        return ev
    }

    it('opens it like a click, and claims the key', async () => {
        const { grid, events } = await mount(NAVIGABLE)
        grid.ctx = { item: ROWS[0], section: 'body', column: { path: 'status' } }
        const ev = enter(grid)
        expect(ev.defaultPrevented).toBe(true)
        expect(events.filter(e => e.type === 'action-requested')).toHaveLength(1)
    })

    it('not while editing a cell (interaction mode), on a repeat, or for another key', async () => {
        const { grid, events } = await mount(NAVIGABLE)
        grid.ctx = { item: ROWS[0], section: 'body', column: { path: 'status' } }
        grid.interacting = true
        enter(grid)
        grid.interacting = false
        enter(grid, { repeat: true })
        enter(grid, { key: 'Space' })
        expect(events.filter(e => e.type === 'action-requested')).toEqual([])
    })
})

describe('mateu-table: selection', () => {
    it('the selection lands in <id>_selected_items without group markers, and notifies the listing', async () => {
        const { t, grid, events } = await mount({ ...NAVIGABLE, rowsSelectionEnabled: true, onRowSelectionChangedActionId: 'selected' })
        expect(t.shadowRoot!.querySelector('vaadin-grid-selection-column')).not.toBeNull()
        grid.dispatchEvent(new CustomEvent('selected-items-changed', { detail: { value: [ROWS[0], { __mateuGroup: {}, _rowNumber: 'g' }] } }))
        expect(t.state.people_selected_items).toEqual([ROWS[0]])
        expect(events.map(e => e.type)).toEqual(['mateu-selection-changed', 'action-requested'])
        expect(events[1].detail).toEqual({ actionId: 'selected' })
    })

    it('an empty selection replacing an empty one is not news', async () => {
        const { grid, events } = await mount({ ...NAVIGABLE, rowsSelectionEnabled: true })
        grid.dispatchEvent(new CustomEvent('selected-items-changed', { detail: { value: [] } }))
        expect(events).toEqual([])
    })
})

describe('mateu-table: rows', () => {
    it('grouped listings interleave a marker row per group, which is not selectable and gets the group part', async () => {
        const { grid } = await mount({ groupBy: 'status', columns: [column({ id: 'name' }), column({ id: 'status' })] },
            { data: { people: { page: { content: ROWS, totalElements: 2 }, groups: [{ value: 'OK', count: 1 }, { value: 'KO', count: 1 }] } } })
        expect(grid.items.map((r: any) => r.__mateuGroup ? 'group:' + r.__mateuGroup.value : r.name)).toEqual(['group:OK', 'Ada', 'group:KO', 'Alan'])
        const selectable = (grid as any).isItemSelectable
        expect(selectable(grid.items[0])).toBe(false)
        expect(selectable(grid.items[1])).toBe(true)
        expect(grid.cellPartNameGenerator(null, { item: grid.items[0] })).toBe('mateu-group-row')
    })

    it('@RowStatus tones the whole row', async () => {
        const { grid } = await mount({ rowStatusField: 'tone', columns: [column({ id: 'name' })] },
            { rows: [{ _rowNumber: 0, name: 'Ada', tone: 'success' }] })
        expect(grid.cellPartNameGenerator(null, { item: { tone: 'success' } })).toBe('mateu-row-success')
    })

    it('no selection, grouping or tone: no part name generator at all', async () => {
        const { grid } = await mount({ columns: [column({ id: 'name' })] })
        expect(grid.cellPartNameGenerator).toBeNull()
    })

    it('the theme carries the declared grid variants', async () => {
        const { grid } = await mount({ columns: [], wrapCellContent: true, compact: true, noBorder: true, noRowBorder: true, columnBorders: true, rowStripes: true })
        expect(grid.getAttribute('theme')!.trim().split(/\s+/)).toEqual(['wrap-cell-content', 'compact', 'no-border', 'no-row-borders', 'column-borders', 'row-stripes'])
    })

    it('@DragRows: the dragged rows travel as their ids under the drag type, markers excluded', async () => {
        const { grid } = await mount({ dragType: 'booking', columns: [column({ id: 'id', identifier: true }), column({ id: 'name' })] })
        expect(grid.hasAttribute('rows-draggable')).toBe(true)
        const setDragData = vi.fn(), setDraggedItemsCount = vi.fn()
        grid.dispatchEvent(new CustomEvent('grid-dragstart', { detail: { draggedItems: [ROWS[0], { __mateuGroup: {}, _rowNumber: 'g' }, ROWS[1]], setDragData, setDraggedItemsCount } }))
        expect(setDragData).toHaveBeenCalledWith('application/x-mateu-booking', '[1,2]')
        expect(setDraggedItemsCount).toHaveBeenCalledWith(2)
    })

    it('a column carrying a tooltipPath shows the row field as tooltip', async () => {
        const { t } = await mount({ columns: [column({ id: 'name', tooltipPath: 'status' })] })
        const tooltip = t.shadowRoot!.querySelector('vaadin-tooltip') as any
        expect(tooltip.generator({ column: { path: 'name' }, item: ROWS[1] })).toBe('KO')
        expect(tooltip.generator({ column: { path: 'other' }, item: ROWS[1] })).toBe('')
    })
})

describe('mateu-table: infinite scrolling', () => {
    const PAGE = Array.from({ length: 10 }, (_, i) => ({ _rowNumber: i, id: i }))

    it('page 0 and pages already loaded are answered from the data; a missing one is fetched once', async () => {
        const { grid, events } = await mount({ infiniteScrolling: true, columns: [] },
            { data: { people: { page: { content: PAGE.slice(0, 5), totalElements: 10 } } } })
        expect(grid.items).toBeUndefined()
        const calls: any[] = []
        grid.dataProvider({ page: 0, pageSize: 5 }, (items: any[], size: number) => calls.push([items.length, size]))
        expect(calls).toEqual([[5, 10]])
        grid.dataProvider({ page: 1, pageSize: 5 }, () => calls.push('unexpected'))
        grid.dataProvider({ page: 1, pageSize: 5 }, () => calls.push('unexpected'))
        const fetches = events.filter(e => e.type === 'fetch-more-elements')
        expect(fetches).toHaveLength(1)
        expect(calls).toHaveLength(1)
    })

    it('the fetch callback answers the grid with the newly arrived slice', async () => {
        const { t, grid, events } = await mount({ infiniteScrolling: true, columns: [] },
            { data: { people: { page: { content: PAGE.slice(0, 5), totalElements: 10 } } } })
        const calls: any[] = []
        grid.dataProvider({ page: 1, pageSize: 5 }, (items: any[], size: number) => calls.push([items.map(i => i.id), size]))
        t.data.people.page.content = PAGE
        events.find(e => e.type === 'fetch-more-elements')!.detail.callback()
        expect(calls).toEqual([[[5, 6, 7, 8, 9], 10]])
    })

    it('a page fully present is answered right away', async () => {
        const { grid, events } = await mount({ infiniteScrolling: true, columns: [] },
            { data: { people: { page: { content: PAGE, totalElements: 10 } } } })
        const calls: any[] = []
        grid.dataProvider({ page: 1, pageSize: 5 }, (items: any[]) => calls.push(items.length))
        expect(calls).toEqual([5])
        expect(events).toEqual([])
    })
})

describe('mateu-table: row details', () => {
    it('a component detail renders as one; a payload keeps its line breaks; empty renders nothing', async () => {
        const { t } = await mount({ columns: [] })
        const host = document.createElement('div')
        const { render } = await import('lit')
        render(t.renderRowDetail({ a: 1 }), host)
        expect(host.querySelector('.row-detail')!.textContent).toBe('{\n  "a": 1\n}')
        render(t.renderRowDetail('line 1\nline 2'), host)
        expect(host.querySelector('.row-detail')!.textContent).toBe('line 1\nline 2')
        render(t.renderRowDetail(''), host)
        expect(host.querySelector('.row-detail')).toBeNull()
    })

    it('useButtonForDetail: a toggle button per row opens and closes the detail', async () => {
        const { t, cols } = await mount({ columns: [column({ id: 'name' })], detailPath: 'detail', useButtonForDetail: true })
        const toggle = cols().filter(c => c.localName === 'vaadin-grid-column').pop()!
        const cell = paint(toggle, ROWS[0])
        const button = cell.querySelector('vaadin-button')!
        expect(button.getAttribute('aria-expanded')).toBe('false')
        ;(button as HTMLElement).click()
        expect(t.detailsOpenedItems).toEqual([ROWS[0]])
    })

    it('multi-line rows: the extra lines are drawn under every row, labelled, and toggle @Details', async () => {
        const { t, grid } = await mount({ columns: [column({ id: 'name', label: 'Name' }), column({ id: 'status', label: 'Status', line: 2 })], detailPath: 'detail' },
            { rows: [{ ...ROWS[0], detail: 'more' }] })
        expect(grid.hasAttribute('data-multiline')).toBe(true)
        expect(grid.detailsOpenedItems).toHaveLength(1)
        const root = document.createElement('div')
        document.body.appendChild(root)
        grid.rowDetailsRenderer(root, grid, { item: grid.detailsOpenedItems[0] })
        await Promise.resolve()
        expect(root.querySelector('.row-line-label')!.textContent).toBe('Status:')
        expect(root.querySelector('.row-line-value')!.textContent).toContain('OK')
        ;(root.querySelector('.row-lines') as HTMLElement).click()
        expect(t.isDetailOpen(grid.detailsOpenedItems[0])).toBe(true)
    })
})

describe('mateu-table: columns', () => {
    it('one grid column per wire column, painting its cells with the column renderer', async () => {
        const { cols } = await mount({ columns: [column({ id: 'name', label: 'Name' }), column({ id: 'status', label: 'Status', sortable: true })] })
        const [name, status] = cols().filter(c => c.localName !== 'vaadin-tooltip')
        expect(name.localName).toBe('vaadin-grid-column')
        expect(status.localName).toBe('vaadin-grid-sort-column')
        expect(paint(name, ROWS[1]).textContent).toContain('Alan')
        expect(paint(status, ROWS[1]).textContent).toContain('KO')
    })

    it('group columns nest their columns under one header', async () => {
        const { t } = await mount({ columns: [{ type: 'ClientSide', metadata: { type: 'GridGroupColumn', label: 'Who', columns: [column({ id: 'name' })] } }] })
        const group = t.shadowRoot!.querySelector('vaadin-grid-column-group')!
        expect(group.getAttribute('header')).toBe('Who')
        expect(group.querySelector('vaadin-grid-column')!.getAttribute('path')).toBe('name')
    })

    it('a details listing gets a leading chevron column', async () => {
        const { cols } = await mount({ columns: [column({ id: 'name' })], detailPath: 'detail' })
        const chevron = cols()[0]
        expect(chevron.getAttribute('width')).toBe('2.25rem')
        expect(paint(chevron, ROWS[0]).querySelector('vaadin-icon')!.getAttribute('icon')).toBe('lumo:angle-right')
        expect(paint(chevron, { __mateuGroup: {}, _rowNumber: 'g' }).querySelector('vaadin-icon')).toBeNull()
    })

    it('an empty listing shows the empty state with the listing\'s message', async () => {
        const { t } = await mount({ columns: [], emptyStateMessage: 'No bookings yet' }, { rows: [] })
        expect(t.shadowRoot!.querySelector('[slot="empty-state"]')!.textContent).toContain('No bookings yet')
    })
})
