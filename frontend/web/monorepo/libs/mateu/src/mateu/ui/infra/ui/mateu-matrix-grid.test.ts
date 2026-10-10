import { describe, expect, it } from 'vitest'
import { columnGroupsOf, initiallyCollapsed, matrixLinesOf, toneOf } from './mateu-matrix-grid'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

const grid = {
    type: ComponentMetadataType.MatrixGrid,
    columns: [
        { id: 'a', label: 'Sat 17', group: 'Oct', tone: 'neutral' },
        { id: 'b', label: 'Sat 31', group: 'Oct' },
        { id: 'c', label: 'Sun 1', group: 'Nov' },
    ],
    sections: [
        { id: 'house', title: 'House', rows: [{ id: 'available', label: 'Available' }] },
        { id: 'controls', title: 'Controls', collapsed: true, rows: [{ id: 'ob', label: 'Overbooking', editable: true }] },
        { id: 'loose', title: null, rows: [{ id: 'note', label: 'Note' }] },
    ],
}

describe('matrix grid', () => {
    it('flattens sections into header lines and their rows, honouring collapsed sections', () => {
        const collapsed = initiallyCollapsed(grid)
        expect([...collapsed]).toEqual(['controls'])
        const lines = matrixLinesOf(grid, collapsed)
        expect(lines.map((l) => (l.kind === 'section' ? '§' + l.id : l.row.id))).toEqual(['§house', 'available', '§controls', 'note'])
        expect(lines.find((l) => l.kind === 'row' && l.row.id === 'note')).toMatchObject({ indented: false })
        expect(matrixLinesOf(grid, new Set()).map((l) => (l.kind === 'row' ? l.row.id : '§'))).toContain('ob')
    })

    it('spans column groups over consecutive columns, and has none without groups', () => {
        expect(columnGroupsOf(grid)).toEqual([{ label: 'Oct', span: 2 }, { label: 'Nov', span: 1 }])
        expect(columnGroupsOf({ type: ComponentMetadataType.MatrixGrid, columns: [{ id: 'x' }] })).toEqual([])
    })

    it('a cell tone wins over its column tone; unknown tones are ignored', () => {
        expect(toneOf('danger', 'neutral')).toBe('danger')
        expect(toneOf(null, 'neutral')).toBe('neutral')
        expect(toneOf('purple', null)).toBe('')
    })
})
