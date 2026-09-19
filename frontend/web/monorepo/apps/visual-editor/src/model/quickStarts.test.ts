import { describe, it, expect } from 'vitest'
import { bindDataSource, scaffoldFieldsFromContract, turnIntoListing } from './quickStarts'
import { parsePage } from './pageModel'

const page = (yaml: string) => parsePage(yaml)

describe('quickStarts', () => {
    it('bindDataSource sets the model view (trimmed; blank clears it)', () => {
        const doc = page('type: VerticalLayout\ncontent: []\n')
        expect(bindDataSource(doc, '  com.acme.PersonView ').modelView).toBe('com.acme.PersonView')
        expect(bindDataSource(doc, '   ').modelView).toBeUndefined()
    })

    it('scaffoldFieldsFromContract appends a FormField per field, skipping ones already present', () => {
        const doc = page('type: VerticalLayout\ncontent:\n  - type: FormField\n    id: name\n')
        const out = scaffoldFieldsFromContract(doc, [
            { id: 'name', label: 'Name' }, // already there → skipped
            { id: 'email', label: 'Email', dataType: 'string' },
            { id: 'age', dataType: 'number' },
        ])
        const ids = (out.layout.content ?? []).map((n: any) => n.id)
        expect(ids).toEqual(['name', 'email', 'age'])
        const email = (out.layout.content ?? [])[1] as any
        expect(email).toMatchObject({ type: 'FormField', id: 'email', label: 'Email', dataType: 'string' })
    })

    it('scaffoldFieldsFromContract wraps a non-container root in a VerticalLayout', () => {
        const doc = page('type: Text\ntext: hi\n')
        const out = scaffoldFieldsFromContract(doc, [{ id: 'name' }])
        expect(out.layout.type).toBe('VerticalLayout')
        const ids = (out.layout.content ?? []).map((n: any) => n.type)
        expect(ids).toContain('Text') // original root preserved as a child
        expect(ids).toContain('FormField')
    })

    it('turnIntoListing builds columns from the page fields', () => {
        const doc = page('type: VerticalLayout\ncontent:\n  - type: FormField\n    id: name\n    label: Name\n  - type: FormField\n    id: status\n')
        const out = turnIntoListing(doc)
        expect(out.layout.type).toBe('Listing')
        expect((out.layout as any).columns).toEqual([
            { type: 'GridColumn', id: 'name', label: 'Name' },
            { type: 'GridColumn', id: 'status', label: 'status' },
        ])
    })

    it('turnIntoListing falls back to a default column and is idempotent', () => {
        const empty = turnIntoListing(page('type: VerticalLayout\ncontent: []\n'))
        expect((empty.layout as any).columns).toEqual([{ type: 'GridColumn', id: 'name', label: 'Name' }])
        expect(turnIntoListing(empty)).toBe(empty) // already a listing → unchanged
    })
})
