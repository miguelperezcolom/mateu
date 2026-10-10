import { describe, expect, it } from 'vitest'
import { draggedIdsOf, dragMimeOf, dropParamsOf } from './dragAndDrop'

describe('drag and drop', () => {
    it('a drag type becomes a MIME type a zone can check while hovering', () => {
        expect(dragMimeOf('charge')).toBe('application/x-mateu-charge')
        expect(dragMimeOf('Folio Charge')).toBe('application/x-mateu-folio-charge')
        expect(dragMimeOf(null)).toBe('')
    })
    it('reads ids from plain ids, rows or {data, key} items', () => {
        expect(draggedIdsOf('["C1","C2"]')).toEqual(['C1', 'C2'])
        expect(draggedIdsOf('[{"id":"C1"},{"data":{"id":"C2"}},{"key":3}]')).toEqual(['C1', 'C2', '3'])
        expect(draggedIdsOf('not json')).toEqual([])
    })
    it('the drop action gets the zone parameters plus the dragged ids and type', () => {
        expect(dropParamsOf({ window: 2 }, ['C1'], 'charge')).toEqual({ window: 2, _draggedIds: ['C1'], _dragType: 'charge' })
    })
})
