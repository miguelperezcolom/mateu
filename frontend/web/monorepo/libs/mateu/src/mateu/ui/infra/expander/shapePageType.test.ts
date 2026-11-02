import { describe, expect, it } from 'vitest'
import { expandDefinition, shapePageType } from './expandDefinition'

/** A bundle's page has the page type the server would give it (SeededYamlPage.declaredPageType). */
describe('shapePageType', () => {
    it('a Form filling a template is the template\'s kind of page', () => {
        expect(shapePageType({ type: 'Form', template: { type: 'DashboardLandingPage' } } as never)).toBe('dashboard')
        expect(shapePageType({ type: 'Form', template: { type: 'ItemOverviewPage' } } as never)).toBe('detail')
    })
    it('a Listing page is a collection; anything else says nothing', () => {
        expect(shapePageType({ type: 'Listing' } as never)).toBe('collection')
        expect(shapePageType({ type: 'Form' } as never)).toBeUndefined()
        expect(shapePageType(undefined)).toBeUndefined()
    })
    it('a declared pageType still wins, and the derived one reaches the page', () => {
        const expanded = expandDefinition({ pageType: 'form', layout: { type: 'Listing', id: 'l' } } as never) as never as { fragments: { component: { pageType?: string } }[] }
        const derived = expandDefinition({ layout: { type: 'Listing', id: 'l' } } as never) as never as { fragments: { component: { pageType?: string } }[] }
        expect(JSON.stringify(expanded)).toContain('"pageType":"form"')
        expect(JSON.stringify(derived)).toContain('"pageType":"collection"')
    })
})
