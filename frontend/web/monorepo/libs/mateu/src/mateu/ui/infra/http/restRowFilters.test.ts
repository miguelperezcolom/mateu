import { describe, it, expect } from 'vitest'
import { filterExternalRows } from './restRowFilters.ts'

// A listing declares its filters as FormFields; only the handful of members the semantics turn on
// are relevant here, so the fixtures carry those and are cast at the call.
const field = (over: Record<string, unknown>) => ({ dataType: 'string', stereotype: 'regular', ...over }) as any

const people = [
    { name: 'Luke Skywalker', gender: 'male', height: '172', eye_color: 'blue' },
    { name: 'Leia Organa', gender: 'female', height: '150', eye_color: 'brown' },
    { name: 'Darth Vader', gender: 'male', height: '202', eye_color: 'yellow' },
    { name: 'R2-D2', gender: 'n/a', height: 'unknown', eye_color: 'red' },
]
const columns = ['name', 'gender', 'height', 'eye_color']
const names = (rows: Record<string, unknown>[]) => rows.map(r => r.name)

describe('filtering rows fetched from an external endpoint', () => {

    it('imposes no condition when nothing is set — a bar of filters is additive', () => {
        const filters = [field({ fieldId: 'gender' }), field({ fieldId: 'height', stereotype: 'numberRange' })]
        expect(filterExternalRows(people, columns, filters, {})).toHaveLength(4)
    })

    it('scans the visible columns for the free text, so a hit is always on screen', () => {
        expect(names(filterExternalRows(people, columns, [], { searchText: 'sky' }))).toEqual(['Luke Skywalker'])
        // matched on a column that is not the identifier
        expect(names(filterExternalRows(people, columns, [], { searchText: 'yellow' }))).toEqual(['Darth Vader'])
    })

    it('ignores case and surrounding blanks in the free text', () => {
        expect(names(filterExternalRows(people, columns, [], { searchText: '  LEIA ' }))).toEqual(['Leia Organa'])
    })

    it('matches a plain text filter by containment', () => {
        const filters = [field({ fieldId: 'name' })]
        expect(names(filterExternalRows(people, columns, filters, { name: 'a' })))
            .toEqual(['Luke Skywalker', 'Leia Organa', 'Darth Vader'])
    })

    it('matches an option filter exactly — "male" must not also take "female"', () => {
        const filters = [field({ fieldId: 'gender', options: [{ value: 'male', label: 'Male' }] })]
        expect(names(filterExternalRows(people, columns, filters, { gender: 'male' })))
            .toEqual(['Luke Skywalker', 'Darth Vader'])
    })

    it('takes any of the picked values for a multi-select', () => {
        const filters = [field({ fieldId: 'gender', stereotype: 'multiSelect' })]
        expect(names(filterExternalRows(people, columns, filters, { gender: ['female', 'n/a'] })))
            .toEqual(['Leia Organa', 'R2-D2'])
    })

    it('reads a multi-select restored from the URL as a comma-joined string', () => {
        const filters = [field({ fieldId: 'gender', stereotype: 'multiSelect' })]
        expect(names(filterExternalRows(people, columns, filters, { gender: 'female,n/a' })))
            .toEqual(['Leia Organa', 'R2-D2'])
    })

    it('compares a range NUMERICALLY even though the endpoint serves numbers as strings', () => {
        const filters = [field({ fieldId: 'height', stereotype: 'numberRange' })]
        // as text "99" > "172"; the point of the check is that 172 and 202 pass and 150 does not
        expect(names(filterExternalRows(people, columns, filters, { height_from: '160' })))
            .toEqual(['Luke Skywalker', 'Darth Vader'])
    })

    it('honours each end of a range on its own, and both together, inclusively', () => {
        const filters = [field({ fieldId: 'height', stereotype: 'numberRange' })]
        expect(names(filterExternalRows(people, columns, filters, { height_to: '172' })))
            .toEqual(['Luke Skywalker', 'Leia Organa'])
        expect(names(filterExternalRows(people, columns, filters, { height_from: '150', height_to: '172' })))
            .toEqual(['Luke Skywalker', 'Leia Organa'])
    })

    it('leaves a value that is not a number outside every range, rather than ordering it as text', () => {
        const filters = [field({ fieldId: 'height', stereotype: 'numberRange' })]
        expect(names(filterExternalRows(people, columns, filters, { height_from: '0' })))
            .not.toContain('R2-D2')
    })

    it('combines the free text with the filters — every condition has to hold', () => {
        const filters = [field({ fieldId: 'gender', options: [{ value: 'male', label: 'Male' }] })]
        expect(names(filterExternalRows(people, columns, filters, { searchText: 'a', gender: 'male' })))
            .toEqual(['Luke Skywalker', 'Darth Vader'])
    })

    it('matches a boolean filter by equality, whichever way the value arrives', () => {
        const rows = [{ name: 'a', done: true }, { name: 'b', done: false }]
        const filters = [field({ fieldId: 'done', dataType: 'boolean' })]
        expect(names(filterExternalRows(rows, ['name', 'done'], filters, { done: true }))).toEqual(['a'])
        // after a URL restore the same condition arrives as a string
        expect(names(filterExternalRows(rows, ['name', 'done'], filters, { done: 'false' }))).toEqual(['b'])
    })

    it('returns the very same array when there is nothing to apply', () => {
        expect(filterExternalRows(people, columns, undefined, {})).toBe(people)
    })

    it('survives a filter without a field id and a missing state', () => {
        expect(filterExternalRows(people, columns, [field({})], undefined as any)).toHaveLength(4)
    })
})
