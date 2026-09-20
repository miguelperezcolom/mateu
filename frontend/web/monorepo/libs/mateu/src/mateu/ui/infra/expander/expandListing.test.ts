// Phase 6 — the expander maps a read-only Listing to the wire Crud the way the SERVER does. The
// golden (read-listing.golden.json) was captured from the JAVA backend (ReadListingDefinitionSyncTest
// on the definition-only "read-listing" route): a listing with no proxy/secret actions renders as a
// DIRECT ClientSide Crud (no ServerSide wrapper). Render-parity: structural SUBSET — the golden also
// carries the server's per-field defaults (canEdit/searchable/… and each GridColumn's ~25 defaults).

import { describe, expect, it } from 'vitest'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import golden from '@infra/expander/__fixtures__/read-listing.golden.json'

// The parsed read-listing.yaml.
const listing: FluentNode = {
    type: 'Listing',
    title: 'Read Only People',
    rowRoute: 'read-listing/${row.id}',
    rowsSource: { url: 'https://example.test/api/people' } as unknown as FluentNode,
    columns: [
        { type: 'GridColumn', id: 'name', label: 'Name', identifier: true },
        { type: 'GridColumn', id: 'gender', label: 'Gender' },
    ] as unknown as FluentNode,
}

const goldenComponent = (golden as any).fragments[0].component

describe('client-side expander — read-only Listing → Crud (Phase 6, listing/REST)', () => {
    it('reproduces the server Crud wire (structural subset of the Java golden)', () => {
        expectSubset(expandComponent(listing), goldenComponent)
    })

    it('renames Listing→Crud, defaults crudlType, and carries the Crud node id/sizing', () => {
        const wire = expandComponent(listing) as any
        expect(wire.metadata.type).toBe('Crud')
        expect(wire.metadata.crudlType).toBe('table')
        expect(wire.id).toBe('crud')
        expect(wire.sizing).toBe('fill')
        expect(wire.children).toEqual([])
    })

    it('carries the read + navigate wiring: title, rowRoute and the rows source', () => {
        const md = (expandComponent(listing) as any).metadata
        expect(md.title).toBe('Read Only People')
        expect(md.rowRoute).toBe('read-listing/${row.id}')
        expect(md.rowsSource).toMatchObject({ url: 'https://example.test/api/people' })
    })

    it('expands columns to ClientSide GridColumns, keeping the id in metadata (the column key)', () => {
        const cols = (expandComponent(listing) as any).metadata.columns
        expect(cols).toHaveLength(2)
        expect(cols[0].type).toBe('ClientSide')
        expect(cols[0].metadata).toMatchObject({ type: 'GridColumn', id: 'name', label: 'Name', identifier: true })
        expect(cols[0].id).toBe('name') // also on the node envelope, as the server does
        expect(cols[1].metadata).toMatchObject({ type: 'GridColumn', id: 'gender' })
    })
})
