import { describe, expect, it } from 'vitest'
import { idsChip, parseIds } from './idSetFilter'

describe('the id-set filter (?ids=…)', () => {
    it('reads a comma-joined string or a list, trimmed, without blanks or repeats', () => {
        expect(parseIds('4MBZS7, JXD3G6,,4MBZS7')).toEqual(['4MBZS7', 'JXD3G6'])
        expect(parseIds(['a', ' b ', '', null])).toEqual(['a', 'b'])
        expect(parseIds(undefined)).toEqual([])
        expect(parseIds(' ')).toEqual([])
    })

    it('shows the ids while they are few, a count beyond', () => {
        expect(idsChip('4MBZS7,JXD3G6', 'es')).toEqual({ label: 'Selección', display: '4MBZS7, JXD3G6' })
        expect(idsChip('a,b,c,d', 'es')).toEqual({ label: 'Selección', display: '4 elementos seleccionados' })
        expect(idsChip('a,b,c,d', 'en')).toEqual({ label: 'Selection', display: '4 selected items' })
        expect(idsChip('', 'es')).toBeUndefined()
    })
})
