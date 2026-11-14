import { describe, expect, it } from 'vitest'
import { isCellEdit, noteEditStart, sameCellValue } from './inlineCellCommit'

describe('the commit decision of an inline-edited cell', () => {
    it('blank, equal and same-text values are no edit', () => {
        expect(sameCellValue(null, '')).toBe(true)
        expect(sameCellValue(undefined, null)).toBe(true)
        expect(sameCellValue('Fantasy', 'Fantasy')).toBe(true)
        expect(sameCellValue(3, '3')).toBe(true)
        expect(sameCellValue(true, true)).toBe(true)
        expect(sameCellValue(null, 'x')).toBe(false)
        expect(sameCellValue('x', '')).toBe(false)
        expect(sameCellValue(false, true)).toBe(false)
        expect(sameCellValue('Fantasy', 'ScienceFiction')).toBe(false)
    })

    it('only the row the edit started on, with another value, is an edit', () => {
        const editor = new EventTarget()
        const a = { id: 'B-002', genre: 'Fantasy' }
        const b = { id: 'B-004', genre: 'ScienceFiction' }
        expect(isCellEdit(editor, a, 'genre', 'Mystery')).toBe(false) // nobody started it
        noteEditStart(editor, a)
        expect(isCellEdit(editor, a, 'genre', 'Mystery')).toBe(true)
        expect(isCellEdit(editor, a, 'genre', 'Fantasy')).toBe(false) // unchanged
        expect(isCellEdit(editor, b, 'genre', 'Mystery')).toBe(false) // recycled for another row
        expect(isCellEdit(null, a, 'genre', 'Mystery')).toBe(false)
    })
})
