// A YAML page that fills a design-system page template (`template:` on a `type: Form`), laid out in
// the BROWSER the way the Java server lays it out. Each golden was captured from the Java backend
// (PageTemplateSyncTest with -Dexpander.golden.write=true) from THE SAME YAML read here, so a
// specsOnly bundle shows what a served app shows.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import itemOverview from '@infra/expander/__fixtures__/item-overview-page.golden.json'
import itemOverviewPhoto from '@infra/expander/__fixtures__/item-overview-photo.golden.json'
import welcomePage from '@infra/expander/__fixtures__/welcome-page.golden.json'

const TEST_RESOURCES = resolve(__dirname, '../../../../../../../../../../backend/shared/core/src/test/resources')
const authored = (path: string): FluentNode => parse(readFileSync(resolve(TEST_RESOURCES, path), 'utf-8'))
const goldenComponent = (golden: unknown) => (golden as any).fragments[0].component
// a server-generated id (an Image's, a Text's) is not something the browser has to reproduce
const withoutGeneratedIds = (node: any): any => {
    if (Array.isArray(node)) return node.map(withoutGeneratedIds)
    if (!node || typeof node !== 'object') return node
    const out: any = {}
    for (const [k, v] of Object.entries(node)) {
        if (k === 'id' && typeof v === 'string' && !v.startsWith('item-overview') && v !== 'welcome' && node.metadata?.type !== 'FormField') continue
        out[k] = withoutGeneratedIds(v)
    }
    return out
}

describe('client-side expander — a page template, against the Java golden', () => {
    it('the item overview page: the slots laid out, the template values on the Form', () => {
        const wire = expandComponent(authored('specs/ui/item-overview-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(itemOverview))
        expect(wire.metadata.template).toEqual({ type: 'ItemOverviewPage', avatar: { src: '${state.image}', initials: 'LS' }, photo: null })
        expect(wire.children[0].id).toBe('item-overview')
    })

    it('a photo is the media, and an absent footer leaves no slot', () => {
        const wire = expandComponent(authored('specs/ui/item-overview-photo.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(itemOverviewPhoto))
        expect(JSON.stringify(wire)).not.toContain('item-overview-footer')
    })

    it('the welcome page: the banner (title, subtitle, overline, calls to action) over the tiles', () => {
        const wire = expandComponent(authored('specs/ui/welcome-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(welcomePage))
        expect(wire.metadata.noHeader).toBe(true)
        expect(wire.metadata.toolbar).toEqual([])
        expect(wire.children[0].id).toBe('welcome')
        expect(wire.children[0].metadata.tone).toBe('slate')
        expect(wire.children[0].children.map((b: any) => b.metadata.label)).toEqual(['Browse the characters', 'Explore the planets'])
    })

    it('a page without a template stays free', () => {
        const wire = expandComponent({ type: 'Form', title: 'Free', content: [{ type: 'Text', text: 'x' }] } as FluentNode) as any
        expect(wire.metadata.template).toBeUndefined()
        expect(wire.children[0].metadata.type).toBe('Text')
    })
})
