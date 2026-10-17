// A fluent Grid with a column group (a header spanning several columns), expanded in the browser the
// way GridMapper/GridGroupColumnMapper shape it on the server (GridColumnGroupSyncTest): the grid's
// columns in `metadata.content`, the group's in its own `metadata.columns`, every column a
// ClientSide GridColumn that keeps its `id` in metadata.

import { describe, expect, it } from 'vitest'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'

const grid = {
    type: 'Grid',
    id: 'rooms',
    content: [
        { type: 'GridColumn', id: 'room', label: 'Room' },
        {
            type: 'GridGroupColumn', id: 'occupancy', label: 'Occupancy',
            columns: [
                { type: 'GridColumn', id: 'adults', label: 'Adults' },
                { type: 'GridColumn', id: 'children', label: 'Children' },
            ],
        },
    ],
} as unknown as FluentNode

describe('client-side expander — Grid column groups', () => {
    it('keeps the grid columns in metadata.content, ClientSide-wrapped', () => {
        const wire = expandComponent(grid) as any
        expect(wire.metadata.type).toBe('Grid')
        expect(wire.metadata.content.map((c: any) => c.metadata.type)).toEqual(['GridColumn', 'GridGroupColumn'])
        expect(wire.metadata.content[0]).toMatchObject({ type: 'ClientSide', id: 'room', metadata: { id: 'room' } })
        expect(wire.children).toEqual([])
    })

    it('expands the group\'s own columns the same way', () => {
        const group = (expandComponent(grid) as any).metadata.content[1]
        expect(group.metadata.label).toBe('Occupancy')
        expect(group.metadata.columns.map((c: any) => [c.type, c.metadata.type, c.metadata.id]))
            .toEqual([['ClientSide', 'GridColumn', 'adults'], ['ClientSide', 'GridColumn', 'children']])
    })
})
