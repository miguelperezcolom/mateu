import { describe, expect, it } from 'vitest'
import {
    clickBelongsToRow,
    isDisplayColumn,
    isInteractiveElement,
    rowClickTarget,
    rowOpenOf,
    rowOpenTargetOf,
} from './rowOpen'

const el = (tagName: string, attrs: Record<string, string> = {}) =>
    ({ tagName, getAttribute: (n: string) => attrs[n] ?? null })

const viewCol = { id: 'name', actionId: 'view' }
const plainCol = { id: 'city', dataType: 'string' }

describe('rowOpenOf — which listings are navigable', () => {
    it('a listing whose first column carries the view action opens rows by running it', () => {
        expect(rowOpenOf({ columns: [viewCol, plainCol] })).toEqual({ kind: 'action', actionId: 'view' })
    })
    it('a declared rowRoute wins over the view action', () => {
        expect(rowOpenOf({ rowRoute: 'people/${row.id}', columns: [viewCol] }))
            .toEqual({ kind: 'route', template: 'people/${row.id}' })
    })
    it('a listing with neither is not navigable', () => {
        expect(rowOpenOf({ columns: [plainCol, { id: 'x', actionId: 'cancel' }] })).toBeUndefined()
        expect(rowOpenOf(undefined)).toBeUndefined()
    })
})

describe('isDisplayColumn — the cells that keep their own click', () => {
    it('plain data columns and the view column itself open the row', () => {
        expect(isDisplayColumn(plainCol)).toBe(false)
        expect(isDisplayColumn(viewCol)).toBe(false)
        expect(isDisplayColumn({ id: 's', dataType: 'status' })).toBe(false)
        expect(isDisplayColumn({ id: 'p', stereotype: 'primary' })).toBe(false)
    })
    it('buttons, links, menus, action groups and components are display columns', () => {
        for (const dataType of ['action', 'actionGroup', 'menu', 'component', 'link']) {
            expect(isDisplayColumn({ id: 'c', dataType }), dataType).toBe(true)
        }
        expect(isDisplayColumn({ id: 'c', stereotype: 'button' })).toBe(true)
        expect(isDisplayColumn({ id: 'c', stereotype: 'link' })).toBe(true)
    })
    it('a column with its own action, or an inline editor, keeps its click', () => {
        expect(isDisplayColumn({ id: 'c', actionId: 'approve' })).toBe(true)
        expect(isDisplayColumn({ id: 'c', editable: true })).toBe(true)
    })
    it('a column without metadata (selection, details toggle) never opens the row', () => {
        expect(isDisplayColumn(undefined)).toBe(true)
    })
})

describe('rowOpenTargetOf', () => {
    it('resolves the route against the clicked row', () => {
        expect(rowOpenTargetOf({ kind: 'route', template: 'people/${row.id}' }, { id: 7 }))
            .toEqual({ kind: 'route', route: 'people/7' })
    })
    it('an unresolvable route does nothing rather than leaving somewhere wrong', () => {
        expect(rowOpenTargetOf({ kind: 'route', template: '${row.slug}' }, {})).toBeUndefined()
    })
    it('the view action travels with the row as its parameters', () => {
        const row = { id: 1, name: 'Ann' }
        expect(rowOpenTargetOf({ kind: 'action', actionId: 'view' }, row))
            .toEqual({ kind: 'action', actionId: 'view', parameters: row })
    })
    it('group marker rows and rows flagged viewable:false never open', () => {
        const open = { kind: 'action', actionId: 'view' } as const
        expect(rowOpenTargetOf(open, { __mateuGroup: { value: 'x' } })).toBeUndefined()
        expect(rowOpenTargetOf(open, { id: 1, viewable: false })).toBeUndefined()
        expect(rowOpenTargetOf(open, null)).toBeUndefined()
    })
})

describe('clicks on controls belong to the control', () => {
    it('recognises native and vaadin controls, and ARIA widgets', () => {
        expect(isInteractiveElement(el('A'))).toBe(true)
        expect(isInteractiveElement(el('VAADIN-BUTTON'))).toBe(true)
        expect(isInteractiveElement(el('VAADIN-CHECKBOX'))).toBe(true)
        expect(isInteractiveElement(el('VAADIN-TEXT-FIELD'))).toBe(true)
        expect(isInteractiveElement(el('VAADIN-DATE-PICKER'))).toBe(true)
        expect(isInteractiveElement(el('VAADIN-MENU-BAR'))).toBe(true)
        expect(isInteractiveElement(el('OJ-BUTTON'))).toBe(true)
        expect(isInteractiveElement(el('DIV', { role: 'button' }))).toBe(true)
    })
    it('text, icons, avatars and the grid structure are not controls', () => {
        for (const tag of ['SPAN', 'DIV', 'VAADIN-ICON', 'VAADIN-AVATAR', 'VAADIN-GRID-CELL-CONTENT', 'VAADIN-GRID', 'TD']) {
            expect(isInteractiveElement(el(tag)), tag).toBe(false)
        }
        expect(isInteractiveElement(null)).toBe(false)
        expect(isInteractiveElement(window_like())).toBe(false)
    })
    it('the path is walked only up to the listening element', () => {
        const grid = el('VAADIN-GRID')
        expect(clickBelongsToRow([el('SPAN'), el('VAADIN-GRID-CELL-CONTENT'), grid, el('BUTTON')], grid)).toBe(true)
        expect(clickBelongsToRow([el('SPAN'), el('VAADIN-BUTTON'), grid], grid)).toBe(false)
    })
})

describe('rowClickTarget — the whole decision', () => {
    const open = rowOpenOf({ columns: [viewCol, plainCol] })
    const row = { id: 3 }
    const grid = el('VAADIN-GRID')
    it('a click on a plain cell opens the row', () => {
        expect(rowClickTarget({ open, row, column: plainCol, path: [el('SPAN'), grid], stopAt: grid }))
            .toEqual({ kind: 'action', actionId: 'view', parameters: row })
    })
    it('a click on a button column runs the button, not the row', () => {
        expect(rowClickTarget({ open, row, column: { id: 'b', actionId: 'approve' }, path: [el('SPAN'), grid], stopAt: grid }))
            .toBeUndefined()
    })
    it('a click on the selection checkbox selects, it does not open', () => {
        expect(rowClickTarget({ open, row, column: undefined, path: [el('VAADIN-CHECKBOX'), grid], stopAt: grid }))
            .toBeUndefined()
    })
    it('a click on the view link is handled by the link itself (no double open)', () => {
        expect(rowClickTarget({ open, row, column: viewCol, path: [el('VAADIN-BUTTON'), grid], stopAt: grid }))
            .toBeUndefined()
    })
    it('a listing that is not navigable never opens', () => {
        expect(rowClickTarget({ open: undefined, row, column: plainCol, path: [], stopAt: grid })).toBeUndefined()
    })
})

function window_like() {
    return { tagName: undefined }
}
