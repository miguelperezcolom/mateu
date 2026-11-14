// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

// the overlay-based combo box needs a live layout jsdom does not have: a plain stand-in
vi.hoisted(() => {
    for (const tag of ['vaadin-grid-column', 'vaadin-grid-column-group', 'vaadin-grid-sort-column', 'vaadin-grid-filter-column', 'vaadin-combo-box']) {
        if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
})

import { html, render } from 'lit'
import type { LitElement } from 'lit'
import { columnRenderer } from './renderColumn'

/**
 * vaadin-grid hands the SAME editor element to another row after a search, a page or a sort
 * (3.0-beta.68: searching an @InlineEditing listing for "le guin" saved the Fellowship of the Ring
 * as ScienceFiction and Earthsea's date as 1974-05-01). Lit sets the next row's value before it
 * swaps the event listener, so the editor's value NOTIFICATION reached the previous row's commit.
 * A cell commits only on the user's own `change`, for the row the edit started on.
 */
const options = [{ value: 'Fantasy', label: 'Fantasy' }, { value: 'ScienceFiction', label: 'SF' }]

const recycled = (editorType: string, tag: string, before: Record<string, unknown>, after: Record<string, unknown>) => {
    const column = { type: 'GridColumn', id: 'genre', label: 'Genre', editable: true, editorType, editorOptions: options }
    const vaadinColumn = { path: 'genre', dataset: { dataType: '', stereotype: '' } }
    const el = document.createElement('div') as unknown as LitElement
    document.body.appendChild(el)
    const events: any[] = []
    el.addEventListener('action-requested', (e) => events.push((e as CustomEvent).detail))
    const draw = (item: Record<string, unknown>) =>
        render(html`${columnRenderer(item, { index: 0, item } as never, vaadinColumn as never, column as never, el, '', {}, {}, {}, {})}`, el)
    draw(before)
    const editor = el.querySelector(tag) as HTMLElement & Record<string, any>
    // the user had put the focus on the cell while it showed the first row
    editor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    draw(after)
    expect(el.querySelector(tag)).toBe(editor)
    return { editor, events }
}

afterEach(() => { document.body.innerHTML = '' })

describe('a recycled inline editor', () => {
    for (const [editorType, tag, notification, a, b] of [
        ['select', 'vaadin-combo-box', 'value-changed', 'Fantasy', 'ScienceFiction'],
        ['lookup', 'vaadin-combo-box', 'selected-item-changed', 'Fantasy', 'ScienceFiction'],
        ['date', 'vaadin-date-picker', 'value-changed', '1954-07-29', '1974-05-01'],
        ['datetime', 'vaadin-date-time-picker', 'value-changed', '1954-07-29T10:00', '1974-05-01T10:00'],
        ['time', 'vaadin-time-picker', 'value-changed', '10:00', '11:00'],
        ['boolean', 'vaadin-checkbox', 'checked-changed', false, true],
        ['string', 'vaadin-text-field', 'value-changed', 'Fantasy', 'ScienceFiction'],
        ['number', 'vaadin-number-field', 'value-changed', 1.5, 2.5],
        ['integer', 'vaadin-integer-field', 'value-changed', 1, 2],
    ] as const) {
        it(`${editorType}: binding the next row's value sends nothing, for either row`, () => {
            const { editor, events } = recycled(editorType, tag, { id: 'B-002', genre: a }, { id: 'B-004', genre: b })
            // what an editor announces when the grid binds the next row's value into it
            editor.dispatchEvent(new CustomEvent(notification, { detail: { value: b === true ? b : { value: b, label: String(b) } } }))
            editor.dispatchEvent(new CustomEvent(notification, { detail: { value: b } }))
            // even a `change` now is no edit of the row shown: the edit started on another one
            editor.dispatchEvent(new Event('change'))
            expect(events).toEqual([])
        })
    }

    it('a real edit of the row now shown commits THAT row, and names the edited cell', () => {
        const { editor, events } = recycled('select', 'vaadin-combo-box', { id: 'B-002', genre: 'Fantasy' }, { id: 'B-004', genre: 'ScienceFiction' })
        editor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
        editor.value = 'Fantasy'
        editor.dispatchEvent(new Event('change'))
        expect(events).toEqual([{ actionId: 'update-row', parameters: { _editedRow: { id: 'B-004', genre: 'Fantasy' }, _editedField: 'genre' } }])
    })

    it('a lookup pick commits the picked option of the row being edited', () => {
        const { editor, events } = recycled('lookup', 'vaadin-combo-box', { id: 'B-002', genre: 'Fantasy' }, { id: 'B-004', genre: 'ScienceFiction' })
        editor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
        editor.selectedItem = { value: 'Fantasy', label: 'Fantasy' }
        editor.dispatchEvent(new Event('change'))
        expect(events.map(e => e.parameters._editedRow)).toEqual([{ id: 'B-004', genre: 'Fantasy' }])
    })

    it('a change nobody started (no focus, key or pointer on the editor) commits nothing', () => {
        const column = { type: 'GridColumn', id: 'name', editable: true, editorType: 'string' }
        const el = document.createElement('div') as unknown as LitElement
        document.body.appendChild(el)
        const events: any[] = []
        el.addEventListener('action-requested', (e) => events.push(e))
        render(html`${columnRenderer({ id: 1, name: 'a' }, { index: 0 } as never, { dataset: {} } as never, column as never, el, '', {}, {}, {}, {})}`, el)
        const input = el.querySelector('vaadin-text-field') as HTMLElement & { value: string }
        input.value = 'b'
        input.dispatchEvent(new Event('change'))
        expect(events).toEqual([])
    })
})
