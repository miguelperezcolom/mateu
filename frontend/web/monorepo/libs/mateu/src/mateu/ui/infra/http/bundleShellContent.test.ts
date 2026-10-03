// #557 — under a mount whose root is an APP SHELL a route has two loads, and the bundle must not
// confuse them: the FRESH load (consumedRoute "_empty": a deep link, a reload) is the shell aimed at
// the route; the CONTENT load (the shell filling its slot) is the route's own screen. Answering the
// content load with the shell again rendered HOME, or nested shells until the tab died.
import { afterEach, describe, expect, it } from 'vitest'
import { __setBundleForTests, loadBundleManifest, resolveBundledLoad } from '@infra/http/bundleStore.ts'
import type { DefinitionSpec } from '@infra/expander/expandDefinition.ts'

const shell = (homeRoute: string) => ({
    fragments: [{ targetComponentId: null, component: { type: 'ClientSide', metadata: { type: 'App', homeRoute, homeConsumedRoute: '' } } }],
})
const screen = (name: string, state: Record<string, unknown> = {}) => ({
    fragments: [{ targetComponentId: null, state, component: { type: 'ServerSide', id: name, initialData: { ...state }, children: [] } }],
})
const okFetch = (body: unknown): typeof fetch =>
    (async () => ({ ok: true, json: async () => body })) as unknown as typeof fetch

const appOf = (inc: any) => inc?.fragments?.[0]?.component?.metadata
const idOf = (inc: any) => inc?.fragments?.[0]?.component?.id

const manifest = {
    entries: [
        { route: '', syncPath: '_no_route', ok: true, json: JSON.stringify(shell('vcns')) },
        { route: '/vcns', syncPath: 'vcns', ok: true, json: JSON.stringify(shell('/vcns')), contentJson: JSON.stringify(screen('listing')) },
        {
            route: '/vcns/:id', syncPath: 'vcns/:id', ok: true, routePattern: '^vcns/([^/]+)$', paramNames: ['id'],
            json: JSON.stringify(shell('/vcns/__mateu_param__')),
            contentJson: JSON.stringify(screen('detail', { id: '__mateu_param__' })),
        },
        // an OLD manifest: a sub-route whose only increment is the shell
        { route: '/old', syncPath: 'old', ok: true, json: JSON.stringify(shell('/old')) },
    ],
}

afterEach(() => __setBundleForTests(undefined))

describe('bundle mode — the shell and the content of a route (#557)', () => {
    it('a fresh load of a sub-route is the shell, aimed at that route', async () => {
        await loadBundleManifest('x', okFetch(manifest))
        expect(appOf(resolveBundledLoad('vcns/7', '_empty'))).toMatchObject({ type: 'App', homeRoute: '/vcns/7' })
        expect(appOf(resolveBundledLoad('vcns', '_empty'))).toMatchObject({ homeRoute: '/vcns' })
        // the root keeps its own home
        expect(appOf(resolveBundledLoad('_no_route', '_empty'))).toMatchObject({ homeRoute: 'vcns' })
    })

    it('the content load is the route\'s own screen, with the real path params', async () => {
        await loadBundleManifest('x', okFetch(manifest))
        expect(idOf(resolveBundledLoad('vcns', ''))).toBe('listing')
        const detail = resolveBundledLoad('vcns/7', '') as any
        expect(idOf(detail)).toBe('detail')
        expect(detail.fragments[0].state).toMatchObject({ id: '7' })
        // the placeholder the exporter rendered with must not survive in initialData either
        expect(detail.fragments[0].component.initialData).toMatchObject({ id: '7' })
    })

    it('never answers a content load with a shell (an old manifest falls through instead)', async () => {
        await loadBundleManifest('x', okFetch(manifest))
        expect(resolveBundledLoad('old', '')).toBeUndefined()
    })
})

describe('specs mode — a shell and its screens expanded in the browser', () => {
    const app: DefinitionSpec = { type: 'AppShell', title: 'Networking', menu: [{ type: 'RouteLink', label: 'VCNs', route: 'vcns' }] }
    const vcn: DefinitionSpec = {
        type: 'Form', title: '${state.displayName}',
        content: [{ type: 'FormLayout', content: [{ type: 'FormField', id: 'cidrBlock', label: 'CIDR', readOnly: true }] }],
        actions: [{ id: 'delete', restAction: { source: { ref: 'vcn-delete' } } }],
    }
    const seed = () => __setBundleForTests(undefined, [], [
        { route: '', definition: 'app.yaml' },
        { route: 'vcns/:id', definition: 'vcn.yaml', data: { ref: 'vcn' } },
    ], { 'app.yaml': app, 'vcn.yaml': vcn })

    it('a fresh load of any route of the mount is the expanded shell, aimed at it', () => {
        seed()
        const fresh = resolveBundledLoad('vcns/7', '_empty') as any
        expect(appOf(fresh)).toMatchObject({ type: 'App', title: 'Networking', homeRoute: '/vcns/7' })
        expect(appOf(fresh).menu[0]).toMatchObject({ label: 'VCNs', path: '/vcns', route: '/vcns' })
        // untargeted, so the client aims it at whoever asked
        expect(fresh.fragments[0].targetComponentId).toBeUndefined()
    })

    it('the content load expands the screen, wired to load its record and to delete it', () => {
        seed()
        const content = resolveBundledLoad('vcns/7', '') as any
        const page = content.fragments[0].component
        expect(page.type).toBe('ServerSide')
        expect(page.actions.map((a: any) => a.id)).toEqual(['delete', '__restdata__'])
        expect(page.actions[1].restAction).toMatchObject({ source: { ref: 'vcn' }, resultPath: '' })
        expect(page.triggers).toEqual([{ type: 'OnLoad', actionId: '__restdata__', times: 1 }])
        expect(content.fragments[0].state).toMatchObject({ id: '7' })
        const form = page.children[0]
        expect(form.metadata).toMatchObject({ type: 'Form', title: '${state.displayName}' })
        const field = form.children[0].children[0]
        expect(field.metadata).toMatchObject({ type: 'FormField', fieldId: 'cidrBlock', dataType: 'string', stereotype: 'regular' })
    })
})
