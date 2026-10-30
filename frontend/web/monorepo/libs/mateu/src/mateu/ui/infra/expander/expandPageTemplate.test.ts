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
import dashboardPage from '@infra/expander/__fixtures__/dashboard-page.golden.json'
import generalOverviewPage from '@infra/expander/__fixtures__/general-overview-page.golden.json'
import collectionDetailPage from '@infra/expander/__fixtures__/collection-detail-page.golden.json'
import collectionDetailEmpty from '@infra/expander/__fixtures__/collection-detail-empty.golden.json'
import foldoutPage from '@infra/expander/__fixtures__/foldout-page.golden.json'
import multimediaPage from '@infra/expander/__fixtures__/multimedia-page.golden.json'
import createEditPage from '@infra/expander/__fixtures__/create-edit-page.golden.json'
import guidedProcessPage from '@infra/expander/__fixtures__/guided-process-page.golden.json'
import dataManagementPage from '@infra/expander/__fixtures__/data-management-page.golden.json'
import heroSearchPage from '@infra/expander/__fixtures__/hero-search-page.golden.json'

const TEST_RESOURCES = resolve(__dirname, '../../../../../../../../../../backend/shared/core/src/test/resources')
const authored = (path: string): FluentNode => parse(readFileSync(resolve(TEST_RESOURCES, path), 'utf-8'))
const goldenComponent = (golden: unknown) => (golden as any).fragments[0].component
// a server-generated id (an Image's, a Text's) is not something the browser has to reproduce
const withoutGeneratedIds = (node: any): any => {
    if (Array.isArray(node)) return node.map(withoutGeneratedIds)
    if (!node || typeof node !== 'object') return node
    const out: any = {}
    for (const [k, v] of Object.entries(node)) {
        if (k === 'id' && typeof v === 'string' && !v.startsWith('item-overview') && !['welcome', 'dashboard-kpi', 'dashboard-panels'].includes(v) && !v.startsWith('general-overview') && !v.startsWith('collection-detail') && !v.startsWith('foldout') && v !== 'multimedia-banner' && v !== 'advanced-create-edit' && v !== 'guided-process' && !v.startsWith('data-management') && v !== 'summary' && v !== 'notes' && v !== 'hero-search' && node.metadata?.type !== 'FormField') continue
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

    it('the dashboard landing page: the kpi slot as a scoreboard over the panels', () => {
        const wire = expandComponent(authored('specs/ui/dashboard-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(dashboardPage))
        expect(wire.metadata.template.type).toBe('DashboardLandingPage')
        expect(wire.children.map((c: any) => c.id)).toEqual(['dashboard-kpi', 'dashboard-panels'])
        expect(wire.children[0].children).toHaveLength(2)
        expect(wire.children[1].children).toHaveLength(2)
    })

    it('the general overview page: the main slot beside the info panel', () => {
        const wire = expandComponent(authored('specs/ui/general-overview-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(generalOverviewPage))
        expect(wire.children[0].children.map((c: any) => c.id)).toEqual(['general-overview-main', 'general-overview-info'])
    })

    it('the collection detail page: the list beside the detail, or noSelection without content', () => {
        const wire = expandComponent(authored('specs/ui/collection-detail-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(collectionDetailPage))
        expect(wire.children[0].children.map((c: any) => c.id)).toEqual(['collection-detail-list', 'collection-detail-detail'])
        const empty = expandComponent(authored('specs/ui/collection-detail-empty.yaml')) as any
        expectSubset(withoutGeneratedIds(empty), goldenComponent(collectionDetailEmpty))
        expect(empty.children[0].children.map((c: any) => c.id)).toEqual(['collection-detail-list', 'collection-detail-no-selection'])
    })

    it('the foldout page: one FoldoutLayout with the overview slot and the panels', () => {
        const wire = expandComponent(authored('specs/ui/foldout-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(foldoutPage))
        expect(wire.children[0].metadata.type).toBe('FoldoutLayout')
        expect(wire.children[0].metadata.panels.map((p: any) => p.title)).toEqual(['Specifications', 'Crew'])
    })

    it('the multimedia content page: the banner over the sections', () => {
        const wire = expandComponent(authored('specs/ui/multimedia-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(multimediaPage))
        expect(wire.metadata.noHeader).toBe(true)
        expect(wire.children[0].id).toBe('multimedia-banner')
        expect(wire.children[0].metadata.tone).toBe('plum')
    })

    it('the advanced create and edit page: main and detail as the named slots of one grid', () => {
        const wire = expandComponent(authored('specs/ui/create-edit-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(createEditPage))
        expect(wire.children[0].metadata.gridTemplateAreas).toBe('"main aside"')
        expect(wire.children[0].children.map((c: any) => c.slot)).toEqual(['main', 'aside'])
    })

    it('the guided process page: one tab per step', () => {
        const wire = expandComponent(authored('specs/ui/guided-process-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(guidedProcessPage))
        expect(wire.children[0].children.map((c: any) => c.metadata.label)).toEqual(['Identity', 'Specifications'])
    })

    it('the data management page: the archetype shape with docked panels', () => {
        const wire = expandComponent(authored('specs/ui/data-management-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(dataManagementPage))
        expect(wire.metadata.noHeader).toBe(true)
        expect(wire.children[0].id).toBe('data-management')
    })

    it('the hero search page: the hero over the results', () => {
        const wire = expandComponent(authored('specs/ui/hero-search-page.yaml')) as any
        expectSubset(withoutGeneratedIds(wire), goldenComponent(heroSearchPage))
        expect(wire.children[0].id).toBe('hero-search')
    })

    it('a page without a template stays free', () => {
        const wire = expandComponent({ type: 'Form', title: 'Free', content: [{ type: 'Text', text: 'x' }] } as FluentNode) as any
        expect(wire.metadata.template).toBeUndefined()
        expect(wire.children[0].metadata.type).toBe('Text')
    })
})
