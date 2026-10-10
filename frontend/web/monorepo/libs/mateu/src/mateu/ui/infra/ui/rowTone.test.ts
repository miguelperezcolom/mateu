import { describe, expect, it } from 'vitest'
import { rowToneOf } from './rowTone'

describe('row tones (@RowStatus)', () => {
    it('reads the tone from the row status field: name, enum constant, Status object', () => {
        expect(rowToneOf({ tone: 'warning' }, 'tone')).toBe('warning')
        expect(rowToneOf({ tone: 'DANGER' }, 'tone')).toBe('danger')
        expect(rowToneOf({ tone: 'error' }, 'tone')).toBe('danger')
        expect(rowToneOf({ s: { type: 'SUCCESS', message: 'Paid' } }, 's')).toBe('success')
    })
    it('no field, no value or an unknown value: no tone', () => {
        expect(rowToneOf({ tone: 'warning' }, undefined)).toBeNull()
        expect(rowToneOf({ tone: null }, 'tone')).toBeNull()
        expect(rowToneOf({ tone: 'purple' }, 'tone')).toBeNull()
    })
})
