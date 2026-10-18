// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

// Plain stand-ins for the column/menu elements (no live vaadin-grid in jsdom): the tests assert the
// cell each column kind draws and what a click in it dispatches.
vi.hoisted(() => {
    for (const tag of ['vaadin-grid-column', 'vaadin-grid-sort-column', 'vaadin-grid-filter-column',
        'vaadin-grid-column-group', 'vaadin-combo-box', 'vaadin-menu-bar']) {
        if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
})

import { html, render } from 'lit'
import type { LitElement } from 'lit'
import { columnRenderer, renderColumnOrGroup, sorterChanged } from './renderColumn'
import { createItem } from './menuColumnRenderer'

/**
 * The cells of a listing beyond plain text and the inline editors pinned in renderColumn.test.ts:
 * the editors for dates/times/lookups (the lookup searches the server as you type), the group
 * header row's @GroupAction buttons, the row-level action/menu/button columns (each dispatches
 * `action-on-row-<method>` with the row), the identifier link of a rowRoute listing, and the
 * user-driven header sort.
 */
const col = (over: Record<string, unknown>) => ({ type: 'GridColumn', id: 'name', label: 'Name', ...over })

const cell = (item: Record<string, unknown>, column: Record<string, unknown>, container: Record<string, unknown> = {}) => {
    const c = col(column) as { id: string, dataType?: string, stereotype?: string }
    const vaadinColumn = Object.assign(document.createElement('div'), { path: c.id })
    vaadinColumn.dataset.dataType = c.dataType ?? ''
    vaadinColumn.dataset.stereotype = c.stereotype ?? ''
    const el = Object.assign(document.createElement('div'), container) as unknown as LitElement
    document.body.appendChild(el)
    el.appendChild(vaadinColumn)
    const events: { type: string, detail: any }[] = []
    for (const type of ['action-requested', 'value-changed', 'route-changed', 'navigate-to-requested']) {
        const l = (e: Event) => events.push({ type, detail: (e as CustomEvent).detail })
        document.body.addEventListener(type, l)
        listeners.push([type, l])
    }
    const target = document.createElement('div')
    vaadinColumn.appendChild(target)
    render(html`${columnRenderer(item, { index: 0, item } as never, vaadinColumn as never, c as never, el, '', {}, {}, {}, {})}`, target)
    return { el: target, events }
}

const listeners: [string, EventListener][] = []
afterEach(() => {
    for (const [type, l] of listeners.splice(0)) document.body.removeEventListener(type, l)
    document.body.innerHTML = ''
})

describe('inline editors by type', () => {
    for (const [editorType, tag, event] of [
        ['number', 'vaadin-number-field', 'change'],
        ['date', 'vaadin-date-picker', 'value-changed'],
        ['time', 'vaadin-time-picker', 'value-changed'],
        ['datetime', 'vaadin-date-time-picker', 'value-changed'],
    ] as const) {
        it(`${editorType}: a ${tag} named after its column, committing the row`, () => {
            const { el, events } = cell({ id: 1, name: null }, { editable: true, editorType, label: 'When' })
            const editor = el.querySelector(tag) as HTMLElement & { value: string }
            expect(editor.getAttribute('accessible-name')).toBe('When')
            const value = editorType === 'number' ? '2.5' : '2026-10-17'
            if (event === 'change') {
                editor.value = value
                editor.dispatchEvent(new Event('change'))
            } else {
                editor.dispatchEvent(new CustomEvent(event, { detail: { value } }))
            }
            expect(events[0].detail.parameters._editedRow.name).toBe(editorType === 'number' ? 2.5 : value)
        })
    }

    it('lookup: the combo searches the server through the column search action and is fed its options', () => {
        const row = { id: 1, name: 'c1' }
        const { el, events } = cell(row, { editable: true, editorType: 'lookup' }, { field: { fieldId: 'lines' }, state: { lines: [row] } })
        const combo = el.querySelector('vaadin-combo-box') as HTMLElement & { dataProvider: any, selectedItem: any }
        // an id not among the options shows the id until a label is known
        expect(combo.selectedItem).toEqual({ value: 'c1', label: 'c1' })
        const answered: any[] = []
        combo.dataProvider({ filter: 'ac', pageSize: 10, page: 0 }, (items: any[], size: number) => answered.push([items, size]))
        const search = events.find(e => e.type === 'action-requested')!
        expect(search.detail.actionId).toBe('search-lines-name')
        expect(search.detail.parameters).toEqual({ searchText: 'ac', size: 10, page: 0 })
        expect(search.detail.callbackonly).toBe(true)
        search.detail.callback({ fragments: [{ data: { 'lines-name': { content: [{ value: 'c2', label: 'Acme' }], totalElements: 1 } } }] })
        expect(answered).toEqual([[[{ value: 'c2', label: 'Acme' }], 1]])
        // picking the current value again is not an edit; picking another one is
        combo.dispatchEvent(new CustomEvent('selected-item-changed', { detail: { value: { value: 'c1', label: 'C1' } } }))
        combo.dispatchEvent(new CustomEvent('selected-item-changed', { detail: { value: { value: 'c2', label: 'Acme' } } }))
        expect(row.name).toBe('c2')
        expect(events.filter(e => e.type === 'value-changed')).toHaveLength(1)
    })

    it('lookup: an empty search answer feeds an empty page', () => {
        const { el, events } = cell({ id: 1, name: null }, { editable: true, editorType: 'lookup', editorOptions: [{ value: 'a', label: 'A' }] })
        const combo = el.querySelector('vaadin-combo-box') as HTMLElement & { dataProvider: any, selectedItem: any }
        expect(combo.selectedItem).toBeUndefined()
        const answered: any[] = []
        combo.dataProvider({ filter: '', pageSize: 5, page: 0 }, (items: any[], size: number) => answered.push([items, size]))
        events[0].detail.callback(undefined)
        expect(answered).toEqual([[[], 0]])
    })
})

describe('group header rows', () => {
    const marker = { __mateuGroupBy: 'name', __mateuGroup: { value: 'Spain', count: 3, hiddenActions: ['archive'] }, _rowNumber: 'g' }
    const meta = {
        columns: [{ metadata: { id: 'name' } }, { metadata: { type: 'GridGroupColumn', columns: [{ metadata: { id: 'status' } }] } }],
        groupActions: [{ actionId: 'notify', label: 'Notify' }, { actionId: 'archive', label: 'Archive' }],
    }

    it('the last column carries the visible @GroupAction buttons, which run with the group value', () => {
        const { el, events } = cell(marker, { id: 'status' }, { metadata: meta })
        const buttons = Array.from(el.querySelectorAll('vaadin-button')) as HTMLElement[]
        expect(buttons.map(b => b.textContent!.trim())).toEqual(['Notify'])
        buttons[0].click()
        expect(events).toEqual([{ type: 'action-requested', detail: { actionId: 'action-on-row-notify', parameters: { _groupValue: 'Spain' } } }])
    })

    it('other columns show the group label (or nothing) and no buttons', () => {
        const { el } = cell(marker, { id: 'name' }, { metadata: meta })
        expect(el.querySelector('vaadin-button')).toBeNull()
        expect(el.textContent).toContain('Spain')
    })
})

describe('cells by column kind', () => {
    it('an action column runs action-on-row-<method> with the row; a null action leaves the cell empty', () => {
        const row = { id: 1, cancel: { methodNameInCrud: 'cancel', label: 'Cancel', icon: '' } }
        const { el, events } = cell(row, { id: 'cancel', dataType: 'action' })
        const button = el.querySelector('vaadin-button') as HTMLElement
        expect(button.textContent!.trim()).toBe('Cancel')
        button.click()
        expect(events[0].detail).toEqual({ actionId: 'action-on-row-cancel', parameters: { _clickedRow: row } })
        expect(cell({ id: 2, cancel: null }, { id: 'cancel', dataType: 'action' }).el.querySelector('vaadin-button')).toBeNull()
    })

    it('an icon-only action is an icon button titled by nothing', () => {
        const { el } = cell({ go: { methodNameInCrud: 'go', icon: 'vaadin:arrow-right' } }, { id: 'go', dataType: 'action' })
        const button = el.querySelector('vaadin-button')!
        expect(button.getAttribute('theme')).toBe('tertiary icon')
        expect(button.querySelector('vaadin-icon')!.getAttribute('icon')).toBe('vaadin:arrow-right')
    })

    it('the select column of a lookup dialog is a Select button', () => {
        const row = { id: 7 }
        const { el, events } = cell(row, { id: 'select', dataType: 'action' })
        ;(el.querySelector('vaadin-button') as HTMLElement).click()
        expect(events[0].detail).toEqual({ actionId: 'action-on-row-select', parameters: { _clickedRow: row } })
    })

    it('an action group of one is drawn as its button, not hidden behind a menu', () => {
        const row = { actions: { actions: [{ methodNameInCrud: 'open', label: 'Open' }] } }
        const { el, events } = cell(row, { id: 'actions', dataType: 'actionGroup' })
        expect(el.querySelector('vaadin-menu-bar')).toBeNull()
        ;(el.querySelector('vaadin-button') as HTMLElement).click()
        expect(events[0].detail.actionId).toBe('action-on-row-open')
    })

    it('an action group of several is a ··· menu whose items run their action with the row', () => {
        const row = { id: 3, actions: { actions: [{ methodNameInCrud: 'open', label: 'Open' }, { methodNameInCrud: 'drop', label: 'Drop', icon: 'vaadin:trash' }] } }
        const { el, events } = cell(row, { id: 'actions', dataType: 'menu' })
        const bar = el.querySelector('vaadin-menu-bar') as HTMLElement & { items: any[] }
        const [open, drop] = bar.items[0].children
        expect(bar.items[0].text).toBe('···')
        expect(open.text).toBe('Open')
        expect(drop.component.localName).toBe('vaadin-context-menu-item')
        bar.dispatchEvent(new CustomEvent('item-selected', { detail: { value: drop } }))
        expect(events[0].detail).toEqual({ actionId: 'action-on-row-drop', parameters: { _clickedRow: row } })
    })

    it('an empty action group is an empty cell', () => {
        const { el } = cell({ actions: { actions: [] } }, { id: 'actions', dataType: 'actionGroup' })
        expect(el.querySelector('vaadin-menu-bar, vaadin-button')).toBeNull()
    })

    it('a column with an actionId is a button running it with the row; a button stereotype without one is a link', () => {
        const row = { id: 9, name: 'Ada' }
        const { el, events } = cell(row, { actionId: 'greet' })
        const button = el.querySelector('vaadin-button') as HTMLElement
        expect(button.textContent!.trim()).toBe('Ada')
        button.click()
        expect(events[0].detail).toEqual({ actionId: 'greet', parameters: row })
        const link = cell({ name: 'https://mateu.io' }, { stereotype: 'button', text: 'Docs' }).el.querySelector('a')!
        expect(link.getAttribute('href')).toBe('https://mateu.io')
        expect(link.textContent).toBe('Docs')
    })

    it('a javascript: href from a row is never made a link target', () => {
        const link = cell({ name: 'javascript:alert(1)' }, { stereotype: 'button' }).el.querySelector('a')!
        expect(link.hasAttribute('href')).toBe(false)
    })

    for (const [what, over, row, check] of [
        ['a status', { dataType: 'status' }, { name: 'OK' }, 'Ok'],
        ['a boolean', { dataType: 'bool' }, { name: true }, ''],
        // two decimals in the UI locale (jsdom's browser language is en-US)
        ['a money stereotype', { stereotype: 'money' }, { name: 1234.5 }, '1,234.50'],
        ['an Amount', { dataType: 'money' }, { name: { value: 12, locale: 'en-US', currency: 'USD' } }, '$12.00'],
        ['a primary cell', { stereotype: 'primary' }, { name: 'Lead' }, 'Lead'],
    ] as const) {
        it(`${what} column draws its value`, () => {
            const { el } = cell(row, over)
            expect(el.innerHTML.length).toBeGreaterThan(0)
            if (check) expect(el.textContent).toContain(check)
        })
    }

    it('createItem builds a menu item with its icon and label, disabled when the action is', () => {
        const item = createItem({ icon: 'vaadin:trash', label: 'Drop', disabled: true }) as HTMLElement & { disabled: boolean }
        expect(item.querySelector('vaadin-icon')!.getAttribute('icon')).toBe('vaadin:trash')
        expect(item.textContent).toBe('Drop')
        expect(item.disabled).toBe(true)
    })
})

describe('the identifier link of a rowRoute listing', () => {
    it('a plain click navigates in-app; a modified click is left to the browser (new tab)', () => {
        const { el, events } = cell({ id: 42, name: 'Ada' }, { identifier: true }, { metadata: { rowRoute: 'people/${row.id}' } })
        const a = el.querySelector('a')!
        const modified = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })
        a.dispatchEvent(modified)
        expect(modified.defaultPrevented).toBe(false)
        expect(events).toEqual([])
        const plain = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
        a.dispatchEvent(plain)
        expect(plain.defaultPrevented).toBe(true)
        expect(events.map(e => e.type)).toEqual(['route-changed', 'navigate-to-requested'])
        expect(events[0].detail.route).toBe('people/42')
        a.dispatchEvent(new MouseEvent('mouseover'))
        expect(a.style.textDecoration).toBe('underline')
        a.dispatchEvent(new MouseEvent('mouseout'))
        expect(a.style.textDecoration).toBe('none')
    })
})

describe('header sort and column groups', () => {
    it('only a sort the USER asked for is re-dispatched to the listing', () => {
        const grid = document.createElement('div')
        document.body.appendChild(grid)
        const sorter = Object.assign(document.createElement('div'), { path: 'name', direction: 'asc' })
        grid.appendChild(sorter)
        const sorts: any[] = []
        grid.addEventListener('sort-direction-changed', (e) => sorts.push((e as CustomEvent).detail))
        grid.addEventListener('sorter-changed', sorterChanged as EventListener)
        sorter.dispatchEvent(new CustomEvent('sorter-changed', { bubbles: true, detail: {} }))
        expect(sorts).toEqual([])
        sorter.dispatchEvent(new CustomEvent('sorter-changed', { bubbles: true, detail: { fromSorterClick: true } }))
        expect(sorts).toEqual([{ grid, path: 'name', direction: 'asc' }])
    })

    it('a group column renders its label (interpolated) over its columns, footers per column', () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const group = { type: 'ClientSide', metadata: { type: 'GridGroupColumn', label: '${state.who}', columns: [{ metadata: col({ id: 'a', filterable: true }) }, { metadata: col({ id: 'b' }) }] } }
        render(renderColumnOrGroup(group as never, {} as LitElement, '', { who: 'Guests' }, {}, {}, {}, { b: '10' }), host)
        const g = host.querySelector('vaadin-grid-column-group')!
        expect(g.getAttribute('header')).toBe('Guests')
        const [a, b] = Array.from(g.children) as (HTMLElement & { footerRenderer?: unknown, headerRenderer?: any })[]
        expect(a.localName).toBe('vaadin-grid-filter-column')
        expect(a.footerRenderer).toBeUndefined()
        expect(typeof b.footerRenderer).toBe('function')
        const header = document.createElement('div')
        a.headerRenderer(header, a)
        expect(header.textContent).toBe('Name')
    })
})
