import { describe, expect, it } from 'vitest'
import { byLine, isMultiLine, lineOf, lineValueText, splitLines } from './listingLines'

const cols = [
    { id: 'hotel' },
    { id: 'total', line: 2 },
    { id: 'holder', line: 1 },
    { id: 'version', line: 3 },
    { id: 'status', line: 2 },
    { id: 'arrival', line: null },
]

describe('listingLines', () => {
    it('a column without line is on line 1', () => {
        expect(lineOf({})).toBe(1)
        expect(lineOf({ line: null })).toBe(1)
        expect(lineOf({ line: 0 })).toBe(1)
        expect(lineOf({ line: 2 })).toBe(2)
        expect(lineOf(undefined)).toBe(1)
    })

    it('is multi-line only when some column is beyond line 1', () => {
        expect(isMultiLine([{ id: 'a' }, { id: 'b', line: 1 }] as any)).toBe(false)
        expect(isMultiLine([])).toBe(false)
        expect(isMultiLine(undefined)).toBe(false)
        expect(isMultiLine(cols)).toBe(true)
    })

    it('splits by line keeping wire order inside each line', () => {
        const { first, extra } = splitLines(cols)
        expect(first.map(c => c.id)).toEqual(['hotel', 'holder', 'arrival'])
        expect(extra.map(l => l.map(c => c.id))).toEqual([['total', 'status'], ['version']])
    })

    it('reads the metadata through a wrapper', () => {
        const wrapped = cols.map(c => ({ id: c.id, metadata: c }))
        const { first, extra } = splitLines(wrapped, w => w.metadata)
        expect(first.map(c => c.id)).toEqual(['hotel', 'holder', 'arrival'])
        expect(extra.length).toBe(2)
    })

    it('without @Line the split is the listing unchanged', () => {
        const plain = [{ id: 'a' }, { id: 'b' }]
        const { first, extra } = splitLines(plain)
        expect(first).toEqual(plain)
        expect(extra).toEqual([])
    })

    it('orders columns line by line for "first N" layouts', () => {
        expect(byLine(cols).map(c => c.id)).toEqual(['hotel', 'holder', 'arrival', 'total', 'status', 'version'])
    })

    it('renders values as text', () => {
        expect(lineValueText({ type: 'SUCCESS', message: 'Confirmed' })).toBe('Confirmed')
        expect(lineValueText({ amount: 120, currency: 'EUR' })).toBe('120 EUR')
        expect(lineValueText(null)).toBe('')
        expect(lineValueText(7)).toBe('7')
        expect(lineValueText(true)).toBe('✓')
        expect(lineValueText(['a', 'b'])).toBe('a, b')
    })
})
