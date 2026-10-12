import { describe, expect, it } from 'vitest'
import { parsePage, serializePage } from './pageModel'
import { PAGE_TYPES, hasPageSettings, pageTypeOf, withPageType } from './pageType'

describe('pageType — the page family on a YAML definition (the twin of @PageTemplate)', () => {
    it('offers exactly the PageType values, lower-cased as on the wire', () => {
        expect([...PAGE_TYPES]).toEqual(['landing', 'collection', 'detail', 'form', 'process', 'dashboard'])
    })

    it('a bare definition carries it on its root object', () => {
        const doc = parsePage('type: Form\ntitle: Orders\n')
        expect(pageTypeOf(doc)).toBeUndefined()
        const typed = withPageType(doc, 'form')
        expect(pageTypeOf(typed)).toBe('form')
        expect(serializePage(typed)).toBe('type: Form\ntitle: Orders\npageType: form\n')
        // "inferred" removes it again
        expect(serializePage(withPageType(typed, ''))).toBe('type: Form\ntitle: Orders\n')
    })

    it('an envelope carries it beside layout:', () => {
        const doc = parsePage('layout:\n  type: Form\n  title: Orders\nactions: []\n')
        const typed = withPageType(doc, 'process')
        expect(pageTypeOf(typed)).toBe('process')
        expect(serializePage(typed)).toContain('\npageType: process\n')
        expect(serializePage(typed)).not.toMatch(/ {2}pageType/)
        const back = withPageType(typed, undefined)
        expect(serializePage(back)).not.toContain('pageType')
        expect(serializePage(back)).toContain('actions: []')
    })

    it('reads a value it does not know (a newer schema, a hand edit) instead of dropping it', () => {
        expect(pageTypeOf(parsePage('type: Form\npageType: wizardish\n'))).toBe('wizardish')
    })

    it('a partial (a fragment inlined elsewhere) has no page settings', () => {
        expect(hasPageSettings(parsePage('content:\n  - type: Text\n    text: hi\n'))).toBe(false)
        expect(hasPageSettings(parsePage('type: Form\n'))).toBe(true)
    })
})
