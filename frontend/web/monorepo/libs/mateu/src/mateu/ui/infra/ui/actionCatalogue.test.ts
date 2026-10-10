// The ACTION catalogue, client side: owner first, then the catalogue, then the server. The golden
// (action-catalogue.golden.json) is captured from the JAVA backend by ActionCatalogueSyncTest
// (-Dmateu.golden.write=true) over mount-home/action-catalogue — the same actions.yaml / orders.yaml
// as the raw entries below — so the browser's lowering and page inlining are pinned to the server's.

import { afterEach, describe, expect, it } from 'vitest'
import {
    actionCatalogue, getCatalogueAction, lowerCatalogue, referencedCatalogueActions, resolveOwnerFirst,
    setActionCatalogue, setAuthoredActionCatalogue,
} from '@infra/ui/actionCatalogue'
import { shellActionFor, shellFlowFor } from '@infra/ui/shellFlows'
import { expandAppShell, expandDefinition } from '@infra/expander/expandDefinition'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import golden from '@infra/expander/__fixtures__/action-catalogue.golden.json'

// actions.yaml + catalogs/more.yaml of the Java fixture, parsed (in discovery order).
const raw = [
    { id: 'newOrder', description: 'Start a new order', steps: [{ type: 'MarkClean' }, { type: 'Navigate', route: 'orders/new' }] },
    { id: 'refreshCustomers', description: 'Re-read the customers', restAction: { source: { url: 'https://example.test/api/customers', method: 'POST' }, successMessage: 'Refreshed' } },
    { id: 'refresh', steps: [{ type: 'Emit', event: 'catalogue-refresh' }] },
    { id: 'chained', steps: [{ type: 'RunAction', actionId: 'newOrder' }] },
    { id: 'serverOnly', confirmationRequired: true },
    { id: 'fromOtherFile', steps: [{ type: 'Navigate', route: 'home' }] },
]

// orders.yaml of the Java fixture.
const orders = {
    layout: {
        type: 'VerticalLayout',
        content: [
            { type: 'Button', id: 'new-order', label: 'New order', actionId: 'newOrder' },
            { type: 'Button', id: 'refresh', label: 'Refresh', actionId: 'refresh' },
            { type: 'Button', id: 'chained', label: 'Chained', actionId: 'chained' },
        ],
    },
    actions: [{ id: 'refresh', steps: [{ type: 'Emit', event: 'page-refresh' }] }],
}

const goldenApp = () => (golden as any).shell.fragments[0].component.metadata
const goldenPageActions = () => (golden as any).orders.fragments[0].component.actions as any[]

afterEach(() => setActionCatalogue([]))

describe('the action catalogue — lowering and the store', () => {
    it('keeps only client-runnable entries, lowered like the server and without their description', () => {
        const lowered = lowerCatalogue(raw)
        expect(lowered.map((a) => a.id)).toEqual(['newOrder', 'refreshCustomers', 'refresh', 'chained', 'fromOtherFile'])
        expect((lowered[0] as any).description).toBeUndefined()
        expect((lowered[0] as any).steps).toBeUndefined()
        expectSubset(lowered, goldenApp().actionCatalogue)
    })

    it('replaces the table on every arrival and answers by id', () => {
        setAuthoredActionCatalogue(raw)
        expect(getCatalogueAction('newOrder')?.commands).toHaveLength(2)
        setActionCatalogue(undefined)
        expect(actionCatalogue()).toEqual([])
        expect(getCatalogueAction('newOrder')).toBeUndefined()
    })
})

describe('owner first', () => {
    it('an owner action wins — even one without steps, which is its server action', () => {
        setAuthoredActionCatalogue(raw)
        const own = [{ id: 'newOrder' }]
        expect(resolveOwnerFirst(own, 'newOrder')).toBe(own[0])
        expect(resolveOwnerFirst([], 'newOrder')?.commands).toHaveLength(2)
        expect(resolveOwnerFirst([], 'nobody')).toBeUndefined()
    })

    it('the shell menu resolves its own flows first, then App.actionCatalogue, then the store', () => {
        const app = { actions: [{ id: 'announce', commands: [{ type: 'DispatchEvent' }] }], actionCatalogue: goldenApp().actionCatalogue }
        expect(shellFlowFor(app as any, 'announce')).toHaveLength(1)
        expect(shellFlowFor(app as any, 'newOrder')?.[1]).toMatchObject({ type: 'NavigateTo', data: 'orders/new' })
        expect(shellActionFor(app as any, 'refreshCustomers')?.restAction).toBeTruthy()
        // a shell that declares the id WITHOUT steps keeps it as its own server action
        expect(shellFlowFor({ actions: [{ id: 'newOrder' }], actionCatalogue: goldenApp().actionCatalogue } as any, 'newOrder')).toBeUndefined()
        // nothing on the App: the store (bundle / Play) answers
        setAuthoredActionCatalogue(raw)
        expect(shellFlowFor({} as any, 'fromOtherFile')).toHaveLength(1)
    })

    it('a page carries the entries its layout names but does not own, transitively — like the server', () => {
        const catalogue = lowerCatalogue(raw)
        const found = referencedCatalogueActions(orders.layout, orders.actions, catalogue)
        expect(found.map((a) => a.id)).toEqual(['newOrder', 'chained'])
    })
})

describe('the expander runs on the catalogue the client holds', () => {
    it('an expanded page carries its own actions first, then the catalogue entries it names (server golden)', () => {
        setAuthoredActionCatalogue(raw)
        const page = expandDefinition(orders as any, 'orders', undefined, { path: 'orders' }).fragments![0].component as any
        expect(page.type).toBe('ServerSide')
        const ids = ['refresh', 'newOrder', 'chained']
        expect(page.actions.map((a: any) => a.id)).toEqual(ids)
        expectSubset(page.actions, goldenPageActions().filter((a) => ids.includes(a.id)))
    })

    it('a page with no actions of its own that names a catalogue id becomes a component that can run it', () => {
        setAuthoredActionCatalogue(raw)
        const bare = { layout: { type: 'Button', label: 'Go', actionId: 'newOrder' } }
        const page = expandDefinition(bare as any, 'go').fragments![0].component as any
        expect(page.type).toBe('ServerSide')
        expect(page.actions.map((a: any) => a.id)).toEqual(['newOrder'])
        // with no catalogue entry it stays the bare layout it always was
        setActionCatalogue([])
        expect((expandDefinition(bare as any, 'go').fragments![0].component as any).type).not.toBe('ServerSide')
    })

    it('an expanded app shell carries the catalogue (AppDto.actionCatalogue)', () => {
        setAuthoredActionCatalogue(raw)
        const app = (expandAppShell({ type: 'AppShell', title: 'x', menu: [] } as any).fragments![0].component as any).metadata
        expectSubset(app.actionCatalogue, goldenApp().actionCatalogue)
    })
})
