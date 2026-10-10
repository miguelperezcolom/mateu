import { describe, it, expect, afterEach } from 'vitest'
import { loadBundleManifest, resolveBundledLoad } from '@infra/http/bundleStore.ts'
import { answerPlayCall, mateuPathOf, routeOfHash, syncPathOf } from './redwoodPlay'
import { buildPlayManifest } from './playManifest'
import { renderedEntries } from './exportBundle'
import { redwoodPlayUrl, frameMessageOf, navigateMessage, answerMessage } from '../canvas/redwoodProtocol'

/** A mount with an app shell at the root and two pages — what Play runs. */
const files = [
    { path: 'project.yaml', content: 'type: Project\nrenderer: redwood\n' },
    { path: 'app.ui.yaml', content: 'type: UI\nbasePath: ""\nroutes: [routes.yaml]\n' },
    {
        path: 'routes.yaml',
        content: 'type: Routes\nroutes:\n  - route: ""\n    layout: app.yaml\n  - route: home\n    layout: home.yaml\n'
            + '  - route: orders\n    layout: orders.yaml\n  - route: orders/:id\n    layout: orders.yaml\n',
    },
    {
        path: 'app.yaml',
        content: 'type: AppShell\ntitle: Shop\nhomeRoute: /home\nmenu:\n  - label: Home\n    route: /home\n  - label: Orders\n    route: /orders\n',
    },
    { path: 'home.yaml', content: 'layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: Welcome\n' },
    { path: 'orders.yaml', content: 'layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: Orders\n' },
]

const load = (manifest: unknown) =>
    loadBundleManifest('m.json', (() => Promise.resolve(new Response(JSON.stringify(manifest)))) as unknown as typeof fetch)

const typeOf = (inc: any) => inc?.fragments?.[0]?.component?.metadata?.type ?? inc?.fragments?.[0]?.component?.type

describe('Play in Redwood: the editor answers the app\'s backend calls', () => {
    afterEach(() => load({}))

    it('reads the mateu path and the route of a sync call', () => {
        expect(mateuPathOf('http://x/mateu/v3/sync/orders')).toBe('/mateu/v3/sync/orders')
        expect(mateuPathOf('/_redwood/app-flow.json')).toBeNull()
        expect(syncPathOf('/mateu/v3/sync/orders%2F7?x=1')).toBe('orders/7')
        expect(syncPathOf('/mateu/v3/sync/')).toBe('_no_route')
        expect(routeOfHash('#/orders?q=1')).toBe('orders?q=1')
    })

    it('the bootstrap gets the app shell, a route load gets the screen — never a shell in the shell', async () => {
        await load(buildPlayManifest(files))
        const boot = answerPlayCall('/mateu/v3/components/_/action', { actionId: '__load__', initiatorComponentId: 'shell' }, resolveBundledLoad, false)
        expect(boot.kind).toBe('answer')
        const shell = (boot as any).json
        expect(typeOf(shell)).toBe('App')
        expect(shell.fragments[0].targetComponentId).toBe('shell')

        const content = answerPlayCall('/mateu/v3/sync/orders', { actionId: '', consumedRoute: '', initiatorComponentId: 'c1' }, resolveBundledLoad, false)
        expect(typeOf((content as any).json)).not.toBe('App')
        expect(JSON.stringify((content as any).json)).toContain('Orders')
        expect((content as any).json.fragments[0].targetComponentId).toBe('c1')
    })

    it('a button goes to the preview backend, or says it needs one', async () => {
        await load(buildPlayManifest(files))
        expect(answerPlayCall('/mateu/v3/sync/orders', { actionId: 'save' }, resolveBundledLoad, true))
            .toEqual({ kind: 'forward', path: '/mateu/v3/sync/orders' })
        const alone = answerPlayCall('/mateu/v3/sync/orders', { actionId: 'save' }, resolveBundledLoad, false) as any
        expect(alone.kind).toBe('answer')
        expect(alone.json.messages[0].text).toContain('backend')
        // the bell, the client log…: nobody is listening without a backend
        expect(answerPlayCall('/mateu/v3/client-log', {}, resolveBundledLoad, false)).toEqual({ kind: 'answer', json: { commands: [], messages: [], fragments: [] } })
    })

    it('the protocol: play url, navigate/answer messages, the frame\'s call and route', () => {
        const url = redwoodPlayUrl('orders', { location: { href: 'http://localhost:5187/index.html' } })
        expect(url).toBe('http://localhost:5187/redwood-preview.html?play=1#/orders')
        expect(navigateMessage('home')).toEqual({ mateuPreview: 'navigate', route: 'home' })
        expect(answerMessage(3, 200, { a: 1 })).toEqual({ mateuPreview: 'answer', id: 3, status: 200, json: { a: 1 } })
        expect(frameMessageOf({ mateuPreview: 'call', id: 1, url: '/mateu/v3/sync/x', body: {} })).not.toBeNull()
        expect(frameMessageOf({ mateuPreview: 'route', route: 'x' })).not.toBeNull()
    })
})

describe('Export for a Redwood project: pre-rendered entries', () => {
    afterEach(() => load({}))

    it('renders every static route: the shell for a fresh load, the screen as its content', async () => {
        await load(buildPlayManifest(files))
        const entries = renderedEntries(['', 'home', 'orders', 'orders/:id'], resolveBundledLoad)
        const by = Object.fromEntries(entries.map((e) => [e.route, e]))
        expect(by[''].ok).toBe(true)
        expect(typeOf(JSON.parse(by[''].json!))).toBe('App')
        expect(by['orders'].ok).toBe(true)
        expect(typeOf(JSON.parse(by['orders'].json!))).toBe('App') // a deep link: the shell, aimed at it
        expect(by['orders'].contentJson).toBeTruthy()
        expect(by['orders'].contentJson).toContain('Orders')
        expect(by['orders/:id'].ok).toBe(false)
    })
})
