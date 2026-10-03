import { describe, expect, it } from 'vitest'
import {
    FOLDOUT_STRIP_WIDTH,
    foldoutSectionStyle,
    initialOpenStates,
    isInside,
    mergeOpenStates,
    readOnlyAsPlainText,
    readOnlyGridLayout,
    fitColumnToWidth,
    visibleSections,
    wheelToRow,
} from './foldoutGeometry'

describe('foldout geometry (Vaadin, as Redwood)', () => {
    it('fixes a declared width, capped to the row', () => {
        const style = foldoutSectionStyle('44rem')
        expect(style).toContain('flex: 0 0 min(44rem, 100%)')
        expect(style).toContain('min-width: min(44rem, 100%)')
        expect(style).toContain('max-width: min(44rem, 100%)')
    })

    it('leaves an undeclared width to the stylesheet', () => {
        expect(foldoutSectionStyle(undefined)).toBe('')
        expect(foldoutSectionStyle('  ')).toBe('')
    })

    it('draws a closed panel as a strip whatever its width', () => {
        const style = foldoutSectionStyle('44rem', false)
        expect(style).toContain(`flex: 0 0 ${FOLDOUT_STRIP_WIDTH}`)
        expect(style).not.toContain('44rem')
    })

    it('opens every panel but those sent with open=false', () => {
        expect(initialOpenStates([{ open: true }, {}, { open: false }, { open: null }])).toEqual([true, true, false, true])
        expect(initialOpenStates(undefined)).toEqual([])
    })

    it('keeps what the user toggled across a repaint of the same panels', () => {
        const first = mergeOpenStates(null, '', [{ title: 'A' }, { title: 'B', open: false }])
        expect(first.states).toEqual([true, false])
        const toggled = [true, true]
        const again = mergeOpenStates(toggled, first.key, [{ title: 'A' }, { title: 'B', open: false }])
        expect(again.states).toBe(toggled)
        const other = mergeOpenStates(toggled, first.key, [{ title: 'A' }, { title: 'C', open: false }])
        expect(other.states).toEqual([true, false])
    })

    it('counts a section as visible when half of it is in the row', () => {
        const rail = { left: 0, right: 1000 }
        expect(visibleSections(rail, [
            { left: 0, right: 400 },      // fully in
            { left: 800, right: 1200 },   // exactly half
            { left: 900, right: 1300 },   // a quarter
            { left: 1100, right: 1400 },  // out
            { left: -500, right: 1500 },  // wider than the row, covering it
        ])).toEqual([true, true, false, false, true])
    })

    it('draws read-only fields of a foldout as plain text, keeping the special ones', () => {
        expect(readOnlyAsPlainText({ readOnly: true, dataType: 'string' }, true)).toBe(true)
        expect(readOnlyAsPlainText({ readOnly: true, dataType: 'date' }, true)).toBe(true)
        expect(readOnlyAsPlainText({ readOnly: true, dataType: 'string' }, false)).toBe(true) // a view page outside a foldout too
        expect(readOnlyAsPlainText({ readOnly: true, stereotype: 'textarea', dataType: 'string' })).toBe(true)
        expect(readOnlyAsPlainText({ readOnly: true, stereotype: 'html', dataType: 'string' })).toBe(false)
        expect(readOnlyAsPlainText({ readOnly: false, dataType: 'string' }, true)).toBe(false)
        expect(readOnlyAsPlainText({ readOnly: true, dataType: 'money' }, true)).toBe(false)
        expect(readOnlyAsPlainText({ readOnly: true, dataType: 'bool' }, true)).toBe(false)
        expect(readOnlyAsPlainText({ readOnly: true, stereotype: 'image', dataType: 'string' }, true)).toBe(false)
        expect(readOnlyAsPlainText({ readOnly: true, stereotype: 'grid', dataType: 'array' }, true)).toBe(false)
    })

    it('finds the foldout across shadow roots', () => {
        const fakeFoldout = { tagName: 'MATEU-VAADIN-FOLDOUT', parentNode: null } as unknown as Node
        const shadow = { host: fakeFoldout, parentNode: null } as unknown as Node
        const field = { tagName: 'MATEU-FIELD', parentNode: shadow } as unknown as Node
        expect(isInside(field, 'mateu-vaadin-foldout')).toBe(true)
        expect(isInside({ tagName: 'DIV', parentNode: null } as unknown as Node, 'mateu-vaadin-foldout')).toBe(false)
    })
    it('a read-only grid shows every row and fits its columns (no inner scroll)', () => {
        expect(readOnlyGridLayout(true, 25)).toEqual({ allRowsVisible: true, theme: 'wrap-cell-content' })
        expect(readOnlyGridLayout(false, 25).allRowsVisible).toBe(false)
        expect(readOnlyGridLayout(false, 3).allRowsVisible).toBe(true)
        const col = fitColumnToWidth({ metadata: { type: 'GridColumn', id: 'amount', width: '12rem', frozen: true } })
        expect(col.metadata).toMatchObject({ id: 'amount', width: '3rem', flexGrow: '1', frozen: false, autoWidth: false })
    })

    it('turns the wheel into paging the row, as Redwood does', () => {
        expect(wheelToRow(0, 100, 0, 1500)).toBe(100)          // down → right
        expect(wheelToRow(0, -100, 600, 1500)).toBe(-100)      // up → back
        expect(wheelToRow(0, 100, 1500, 1500)).toBeNull()      // at the end: the page scrolls
        expect(wheelToRow(0, -100, 0, 1500)).toBeNull()        // at the start: the page scrolls
        expect(wheelToRow(0, 100, 0, 0)).toBeNull()            // nothing to page
        expect(wheelToRow(120, 30, 0, 1500)).toBeNull()        // a horizontal swipe scrolls natively
        expect(wheelToRow(0, 0, 0, 1500)).toBeNull()
    })

    it('leaves the wheel to an inner scroller that still has room that way', () => {
        const middle = { scrollTop: 50, scrollHeight: 500, clientHeight: 200 }
        const bottom = { scrollTop: 300, scrollHeight: 500, clientHeight: 200 }
        const top = { scrollTop: 0, scrollHeight: 500, clientHeight: 200 }
        expect(wheelToRow(0, 100, 0, 1500, [middle])).toBeNull()
        expect(wheelToRow(0, 100, 0, 1500, [bottom])).toBe(100)
        expect(wheelToRow(0, -100, 600, 1500, [top])).toBe(-100)
        expect(wheelToRow(0, -100, 600, 1500, [bottom])).toBeNull()
    })
})
