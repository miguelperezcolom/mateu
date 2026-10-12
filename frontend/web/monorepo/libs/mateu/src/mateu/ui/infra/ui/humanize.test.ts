import { describe, expect, it } from 'vitest'
import { humanizeFieldId } from './humanize'

describe('humanizeFieldId (error messages never name a field by its programmer id)', () => {
    it('splits camelCase and keeps a sentence case', () => {
        expect(humanizeFieldId('title')).toBe('Title')
        expect(humanizeFieldId('startDate')).toBe('Start date')
        expect(humanizeFieldId('vatID')).toBe('Vat id')
    })
    it('reads snake and kebab case', () => {
        expect(humanizeFieldId('check_out')).toBe('Check out')
        expect(humanizeFieldId('room-type')).toBe('Room type')
    })
    it('names a nested field by its own segment, skipping indexes', () => {
        expect(humanizeFieldId('guests.0.name')).toBe('Name')
    })
})
