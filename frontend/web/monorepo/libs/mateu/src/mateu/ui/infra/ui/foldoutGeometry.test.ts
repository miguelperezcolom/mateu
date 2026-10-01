import { describe, expect, it } from 'vitest'
import {
    FOLDOUT_STRIP_WIDTH,
    foldoutSectionStyle,
    initialOpenStates,
    isInside,
    mergeOpenStates,
    readOnlyAsPlainText,
    visibleSections,
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
        expect(readOnlyAsPlainText({ readOnly: true, dataType: 'string' }, false)).toBe(false)
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
})
