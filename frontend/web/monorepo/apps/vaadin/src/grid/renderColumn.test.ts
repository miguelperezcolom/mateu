// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

// The column elements need a live vaadin-grid (jsdom has no layout for one). These tests assert the
// attributes the renderer puts on the column and what its cell renderer draws, so plain elements
// stand in for the three column kinds (and the overlay-based combo box) — defined before the real ones register.
vi.hoisted(() => {
    for (const tag of ['vaadin-grid-column', 'vaadin-grid-column-group', 'vaadin-grid-sort-column', 'vaadin-grid-filter-column', 'vaadin-combo-box']) {
        if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
})

import { html, render } from 'lit'
import type { LitElement } from 'lit'
import { columnRenderer, renderColumn, renderColumnOrGroup } from './renderColumn'

/**
 * A listing's columns: their width policy (fixed / size-to-content / share the rest, the
 * @ColumnWidth contract), and the cells a user edits in place. An inline-edited cell of a CRUD
 * listing persists its row right away (`update-row` with `_editedRow`), and a commit that changes
 * nothing must NOT — vaadin-checkbox fires on initialization, so without the guard every boolean
 * row was saved on page load.
 */
const col = (over: Record<string, unknown>) => ({ type: 'GridColumn', id: 'name', label: 'Name', ...over })

const mountColumn = (column: Record<string, unknown>) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    render(renderColumn(col(column) as never, {} as LitElement, '', {}, {}, {}, {}), host)
    return host.firstElementChild as HTMLElement
}

const cell = (item: Record<string, unknown>, column: Record<string, unknown>, container: Record<string, unknown> = {}) => {
    const c = col(column) as { id: string, dataType?: string, stereotype?: string }
    const vaadinColumn = { path: c.id, dataset: { dataType: c.dataType ?? '', stereotype: c.stereotype ?? '' } }
    const el = Object.assign(document.createElement('div'), container) as unknown as LitElement
    document.body.appendChild(el)
    const events: { type: string, detail: any }[] = []
    for (const type of ['action-requested', 'value-changed']) {
        el.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
    }
    render(html`${columnRenderer(item, { index: 0, item } as never, vaadinColumn as never, c as never, el, '', {}, {}, {}, {})}`, el)
    return { el, events }
}

afterEach(() => { document.body.innerHTML = '' })

describe('column width policy', () => {
    it('a fixed width does not grow', () => {
        const c = mountColumn({ width: '9rem', flexGrow: 0 })
        expect(c.localName).toBe('vaadin-grid-column')
        expect(c.getAttribute('width')).toBe('9rem')
        expect(c.getAttribute('flex-grow')).toBe('0')
        expect(c.hasAttribute('auto-width')).toBe(false)
    })

    it('"auto" sizes to the content (auto-width, no fixed width)', () => {
        const c = mountColumn({ autoWidth: true, flexGrow: 0 })
        expect(c.hasAttribute('auto-width')).toBe(true)
        expect(c.hasAttribute('width')).toBe(false)
    })

    it('no declaration shares the remaining space (no width, no flex-grow override)', () => {
        const c = mountColumn({})
        expect(c.hasAttribute('width')).toBe(false)
        expect(c.hasAttribute('flex-grow')).toBe(false)
    })

    it('sortable and filterable columns use their own elements; type/stereotype ride as data attributes', () => {
        expect(mountColumn({ sortable: true }).localName).toBe('vaadin-grid-sort-column')
        expect(mountColumn({ filterable: true }).localName).toBe('vaadin-grid-filter-column')
        const c = mountColumn({ dataType: 'money', stereotype: 'plain', frozen: true, align: 'end' })
        expect(c.dataset.dataType).toBe('money')
        expect(c.dataset.stereotype).toBe('plain')
        expect(c.hasAttribute('frozen')).toBe(true)
        expect(c.getAttribute('text-align')).toBe('end')
    })
})

describe('inline-edited cells', () => {
    it('a listing cell commit persists the edited row with update-row', () => {
        const row = { id: 1, name: 'Ada' }
        const { el, events } = cell(row, { editable: true, editorType: 'string' })
        const input = el.querySelector('vaadin-text-field') as HTMLElement & { value: string }
        input.value = 'Ada L.'
        input.dispatchEvent(new Event('change'))
        expect(events).toEqual([{ type: 'action-requested', detail: { actionId: 'update-row', parameters: { _editedRow: { id: 1, name: 'Ada L.' } } } }])
    })

    it('a commit that changes nothing is NOT persisted (the checkbox init event, an empty text over null)', () => {
        const { el, events } = cell({ id: 1, name: true }, { editable: true, editorType: 'boolean' })
        el.querySelector('vaadin-checkbox')!.dispatchEvent(new CustomEvent('checked-changed', { detail: { value: true } }))
        expect(events).toEqual([])

        const other = cell({ id: 2, name: null }, { editable: true, editorType: 'string' })
        const input = other.el.querySelector('vaadin-text-field') as HTMLElement & { value: string }
        input.value = ''
        input.dispatchEvent(new Event('change'))
        expect(other.events).toEqual([])
    })

    it('numeric editors commit numbers (blank → null), never strings', () => {
        const { el, events } = cell({ id: 1, name: 3 }, { editable: true, editorType: 'integer' })
        const input = el.querySelector('vaadin-integer-field') as HTMLElement & { value: string }
        input.value = '7'
        input.dispatchEvent(new Event('change'))
        expect(events[0].detail.parameters._editedRow.name).toBe(7)
    })

    it('inside a FORM grid field the edit accumulates into the form state instead of persisting', () => {
        const rows = [{ id: 1, name: 'a' }]
        const { el, events } = cell(rows[0], { editable: true, editorType: 'string' },
            { field: { fieldId: 'lines' }, state: { lines: rows } })
        const input = el.querySelector('vaadin-text-field') as HTMLElement & { value: string }
        input.value = 'b'
        input.dispatchEvent(new Event('change'))
        expect(events).toEqual([{ type: 'value-changed', detail: { fieldId: 'lines', value: [{ id: 1, name: 'b' }] } }])
    })

    it('a select editor offers the column options', () => {
        const { el } = cell({ id: 1, name: 'A' }, { editable: true, editorType: 'select', editorOptions: [{ value: 'A', label: 'Alpha' }] })
        const combo = el.querySelector('vaadin-combo-box') as HTMLElement & { items: unknown[] }
        expect(combo.items).toEqual([{ label: 'Alpha', value: 'A' }])
    })
})

describe('read-only cells', () => {
    it('plain text is truncated with an ellipsis and keeps the full value as a tooltip', () => {
        const { el } = cell({ name: 'A very long name' }, {})
        expect(el.textContent).toContain('A very long name')
    })

    it('an enum column reads as its labels', () => {
        const { el } = cell({ name: 'IN_HOUSE' }, { valueLabels: { IN_HOUSE: 'In house' } })
        expect(el.textContent).toContain('In house')
        expect(el.textContent).not.toContain('IN_HOUSE')
    })

    it('with a rowRoute, the identifier column is a real link to the record', () => {
        const { el } = cell({ id: 42, name: 'Ada' }, { identifier: true }, { metadata: { rowRoute: 'people/${row.id}' } })
        const a = el.querySelector('a')!
        expect(a.getAttribute('href')).toBe('/people/42')
        expect(a.textContent).toContain('Ada')
    })

    it('a group marker row shows its label in bold and is never editable', () => {
        const marker = { __mateuGroupBy: 'name', __mateuGroup: { value: 'X', count: 2 }, name: 'X' }
        const { el } = cell(marker as never, { editable: true, editorType: 'string' },
            { metadata: { columns: [{ metadata: { id: 'name' } }] } })
        expect(el.querySelector('vaadin-text-field')).toBeNull()
    })
})

describe('column groups (a header spanning several columns)', () => {
    const wrap = (metadata: Record<string, unknown>) => ({ type: 'ClientSide', id: metadata.id, metadata, children: [] })

    it('a GridGroupColumn renders a vaadin-grid-column-group holding its child columns', () => {
        const group = wrap({
            type: 'GridGroupColumn', id: 'occupancy', label: 'Occupancy',
            columns: [wrap(col({ id: 'adults', label: 'Adults' })), wrap(col({ id: 'children', label: 'Children' }))],
        })
        const host = document.createElement('div')
        document.body.appendChild(host)
        render(renderColumnOrGroup(group as never, {} as LitElement, '', {}, {}, {}, {}), host)
        const el = host.querySelector('vaadin-grid-column-group')!
        expect(el).not.toBeNull()
        expect(el.getAttribute('header')).toBe('Occupancy')
        const children = [...el.querySelectorAll('vaadin-grid-column')]
        expect(children.map(c => c.getAttribute('path'))).toEqual(['adults', 'children'])
    })

    it('the group label interpolates the state', () => {
        const group = wrap({ type: 'GridGroupColumn', id: 'g', label: '${state.season}', columns: [] })
        const host = document.createElement('div')
        document.body.appendChild(host)
        render(renderColumnOrGroup(group as never, {} as LitElement, '', { season: 'Summer' }, {}, {}, {}), host)
        expect(host.querySelector('vaadin-grid-column-group')!.getAttribute('header')).toBe('Summer')
    })

    it('a plain column still renders as a column', () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        render(renderColumnOrGroup(wrap(col({})) as never, {} as LitElement, '', {}, {}, {}, {}), host)
        expect(host.querySelector('vaadin-grid-column-group')).toBeNull()
        expect(host.querySelector('vaadin-grid-column')).not.toBeNull()
    })
})
