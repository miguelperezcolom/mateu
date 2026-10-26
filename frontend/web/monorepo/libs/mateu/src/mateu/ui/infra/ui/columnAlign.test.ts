import { describe, expect, it } from 'vitest'
import { columnAlign, formatNumberCell } from './columnAlign'

describe('columnAlign (numeric columns right-aligned by default)', () => {
    it('aligns numbers and amounts to the end', () => {
        for (const t of ['integer', 'number', 'double', 'money']) expect(columnAlign(undefined, t)).toBe('end')
    })
    it('centres booleans', () => {
        expect(columnAlign(undefined, 'bool')).toBe('center')
        expect(columnAlign(undefined, 'boolean')).toBe('center')
    })
    it('leaves text at the start and never overrides a declared alignment', () => {
        expect(columnAlign(undefined, 'string')).toBeUndefined()
        expect(columnAlign('start', 'money')).toBe('start')
    })
    it('aligns an amount declared by stereotype (a string column with stereotype money) to the end', () => {
        expect(columnAlign(undefined, 'string', 'money')).toBe('end')
        expect(columnAlign(null, null, 'money')).toBe('end')
        expect(columnAlign(undefined, 'string', 'regular')).toBeUndefined()
        expect(columnAlign('start', 'string', 'money')).toBe('start')
    })
    it('normalises a declared alignment to what vaadin-grid-column text-align takes', () => {
        expect(columnAlign('end', 'string')).toBe('end')
        expect(columnAlign('END', 'string')).toBe('end')
        expect(columnAlign('right', 'string')).toBe('end')
        expect(columnAlign('center', 'string')).toBe('center')
        expect(columnAlign('left', 'number')).toBe('start')
        expect(columnAlign('justify', 'string')).toBeUndefined()
    })
})

describe('formatNumberCell (numbers in the page locale)', () => {
    it('groups thousands from five digits and keeps at most two decimals', () => {
        expect(formatNumberCell(80000, 'number', 'en-US')).toBe('80,000')
        expect(formatNumberCell(80000, 'integer', 'de-DE')).toBe('80.000')
        expect(formatNumberCell(9.999, 'number', 'en-US')).toBe('10')
        expect(formatNumberCell(19.5, 'number', 'en-US')).toBe('19.5')
    })
    it('does not turn a year or a 4-digit code into "2,026"', () => {
        expect(formatNumberCell(2026, 'integer', 'en-US')).toBe('2026')
    })
    it('leaves text, money and non-numeric columns alone', () => {
        expect(formatNumberCell('80000', 'number', 'en-US')).toBe('80000')
        expect(formatNumberCell(80000, 'string', 'en-US')).toBe(80000)
        expect(formatNumberCell(80000, 'money', 'en-US')).toBe(80000)
    })
})
