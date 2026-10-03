import { describe, it, expect } from 'vitest'
import {
    isSearchableMulti,
    removeSearchableId,
    searchableBaseFieldId,
    searchableChips,
    searchableIds,
} from './searchableMulti'

describe('multi-valued @Searchable', () => {

    it('is a searchable field of array data type', () => {
        expect(isSearchableMulti({ stereotype: 'searchable', dataType: 'array' })).toBe(true)
        expect(isSearchableMulti({ stereotype: 'searchable', dataType: 'string' })).toBe(false)
        expect(isSearchableMulti({ stereotype: 'combobox', dataType: 'array' })).toBe(false)
        expect(isSearchableMulti(undefined)).toBe(false)
    })

    it('reads the field id behind a read-only view', () => {
        expect(searchableBaseFieldId('hotels-label')).toBe('hotels')
        expect(searchableBaseFieldId('hotels')).toBe('hotels')
    })

    it('reads the ids in any shape', () => {
        expect(searchableIds(['a', 'b'])).toEqual(['a', 'b'])
        expect(searchableIds(new Set([1, 2]))).toEqual([1, 2])
        expect(searchableIds('a')).toEqual(['a'])
        expect(searchableIds(null)).toEqual([])
        expect(searchableIds(undefined)).toEqual([])
        expect(searchableIds(['a', null, ''])).toEqual(['a'])
    })

    it('labels each chip, falling back to the id', () => {
        expect(searchableChips(['h1', 7, 'zz'], { h1: 'Hotel One', '7': 'Seven' })).toEqual([
            { id: 'h1', label: 'Hotel One' },
            { id: 7, label: 'Seven' },
            { id: 'zz', label: 'zz' },
        ])
        expect(searchableChips(['a'], undefined)).toEqual([{ id: 'a', label: 'a' }])
    })

    it('removes an id, matching a number and its text', () => {
        expect(removeSearchableId(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
        expect(removeSearchableId([1, 2, 3], '2')).toEqual([1, 3])
        expect(removeSearchableId(['a'], 'x')).toEqual(['a'])
    })
})
