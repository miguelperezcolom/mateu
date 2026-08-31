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
        expect(buildIndex([])).toEqual({ routes: [], pages: [], partials: [], appShells: [], viewModels: [] })
    })
})
