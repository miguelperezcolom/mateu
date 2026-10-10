import { describe, it, expect } from 'vitest'
import { buildIndex, ProjectFile } from './projectIndex'

const files: ProjectFile[] = [
    { path: 'back-office.ui.yaml', content: 'type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n' },
    {
        path: 'routes.yaml',
        content:
            'type: Routes\nroutes:\n' +
            '  - route: ""\n    definition: app.yaml\n' +
            '  - route: orders\n    definition: orders.yaml\n' +
            '  - route: users\n    definition: users.yaml\n' +
            '  - route: tasks\n    viewModel: com.acme.TaskCrud\n',
    },
    { path: 'app.yaml', content: 'type: AppShell\ntitle: Back office\n' },
    { path: 'orders.yaml', content: 'type: VerticalLayout\ncontent:\n  - type: Text\n    text: Orders\n' },
    { path: 'users.yaml', content: 'type: VerticalLayout\ncontent: []\n' },
    { path: 'partials/address-block.yaml', content: 'content:\n  - type: FormField\n    id: street\n' },
]

describe('buildIndex', () => {
    it('collects the routes with their definitions and view models', () => {
        const idx = buildIndex(files)
        expect(idx.routes.map((r) => r.route)).toEqual(['', 'orders', 'users', 'tasks'])
        expect(idx.routes.find((r) => r.route === 'orders')?.definition).toBe('orders.yaml')
        expect(idx.routes.find((r) => r.route === 'tasks')?.viewModel).toBe('com.acme.TaskCrud')
    })

    it('lists the page definitions (not the mount, routes, app shell or partials)', () => {
        const idx = buildIndex(files)
        expect(idx.pages.sort()).toEqual(['orders.yaml', 'users.yaml'])
    })

    it('lists the app shells and the partial refs (by stem)', () => {
        const idx = buildIndex(files)
        expect(idx.appShells).toEqual(['app.yaml'])
        expect(idx.partials).toEqual(['address-block'])
    })

    it('collects distinct view models', () => {
        const idx = buildIndex(files)
        expect(idx.viewModels).toEqual(['com.acme.TaskCrud'])
    })

    it('normalizes a specs/ui/ prefix and a leading slash', () => {
        const idx = buildIndex([
            { path: '/specs/ui/about.yaml', content: 'type: VerticalLayout\ncontent: []\n' },
        ])
        expect(idx.pages).toEqual(['about.yaml'])
    })

    it('is empty for no files', () => {
        expect(buildIndex([])).toEqual({ routes: [], pages: [], partials: [], appShells: [], viewModels: [], sources: [] })
    })
})

describe('buildIndex — sources and nested routes', () => {
    it('reads the REST source catalogue (not as a page) and flattens child routes', () => {
        const idx = buildIndex([
            { path: 'sources.yaml', content: 'sources:\n  - name: people\n    source: {url: /api/people}\n  - {description: unnamed}\n' },
            { path: 'routes.yaml', content: 'type: Routes\nroutes:\n  - route: c/:id\n    layout: master.yaml\n    children:\n      - {route: orders, layout: orders.yaml}\n' },
        ])
        expect(idx.sources.map((s) => s.name)).toEqual(['people'])
        expect(idx.pages).toEqual([])
        expect(idx.routes.map((r) => r.route)).toEqual(['c/:id', 'c/:id/orders'])
        expect(idx.routes[1].definition).toBe('orders.yaml')
    })
})

describe('buildIndex: translations and environments', () => {
    const files: ProjectFile[] = [
        { path: 'translations/es.yaml', content: 'messages:\n  orders:\n    title: Pedidos\n    new: Nuevo\n' },
        { path: 'i18n/english.yaml', content: 'type: Translations\nlocale: en\nmessages:\n  orders: {title: Orders}\n  bye: Bye\n' },
        { path: 'environments/pre.yaml', content: 'sources:\n  orders: {baseUrl: https://pre.acme.com}\n' },
        { path: 'envs/prod.yaml', content: 'type: Environment\nname: pro\nsources: {}\n' },
        { path: 'orders.yaml', content: 'type: VerticalLayout\ncontent: []\n' },
    ]

    it('indexes each catalogue (locale + flattened keys) and keeps them out of the pages', () => {
        const idx = buildIndex(files)
        expect(idx.translations?.map((t) => [t.locale, Object.keys(t.messages)])).toEqual([
            ['es', ['orders.title', 'orders.new']],
            ['en', ['orders.title', 'bye']],
        ])
        expect(idx.pages).toEqual(['orders.yaml'])
    })

    it('indexes the environments by name (the file name when the file does not say)', () => {
        expect(buildIndex(files).environments).toEqual(['pre', 'pro'])
    })
})
