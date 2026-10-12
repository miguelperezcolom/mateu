import { describe, it, expect } from 'vitest'
import { buildBundleManifest, clientRenderableRouteCount } from './exportBundle'
import { ProjectFile } from './projectIndex'

const files: ProjectFile[] = [
    { path: 'about.yaml', content: 'type: VerticalLayout\ncontent:\n  - type: Text\n    text: hi\n' },
    { path: 'sub/person.yaml', content: 'layout:\n  type: FormField\n  id: name\n' },
    { path: 'routes.yaml', content: 'routes:\n  - route: about\n    definition: about.yaml\n  - route: person\n    viewModel: com.acme.Person\n' },
    { path: 'sources.yaml', content: 'type: Sources\nsources:\n  - name: people\n    source:\n      url: https://x\n' },
    { path: 'shell.yaml', content: 'type: AppShell\ntitle: App\n' },
    { path: 'mount.yaml', content: 'type: UI\nbasePath: /\n' },
]

describe('exportBundle', () => {
    it('builds a specs-mode manifest: definitions keyed by name, routes + sources sections, skipping shell/mount', () => {
        const m = buildBundleManifest(files, '2026-09-20T00:00:00Z')
        expect(m.staticOnly).toBe(true)
        expect(m.generatedAt).toBe('2026-09-20T00:00:00Z')
        // definitions keyed by their PATH under specs/ui (what a route's layout: names); the app
        // shell ships too (it is what the bundle opens on); mount/routes/sources are not definitions
        expect(Object.keys(m.definitions).sort()).toEqual(['about.yaml', 'shell.yaml', 'sub/person.yaml'])
        expect((m.definitions['about.yaml'] as any).type).toBe('VerticalLayout')
        expect(m.routes?.routes).toHaveLength(2)
        expect(m.sources?.sources).toHaveLength(1)
    })

    it('counts the routes that render with no backend (definition-only, classless)', () => {
        const m = buildBundleManifest(files, 't')
        // `about` is definition-only; `person` binds a viewModel → needs a backend
        expect(clientRenderableRouteCount(m)).toBe(1)
    })

    it('ships the action catalogue once, lowered, and never as a definition', () => {
        const m = buildBundleManifest([
            { path: 'specs/ui/actions.yaml', content: 'type: Actions\nactions:\n  - id: go\n    steps: [{type: Navigate, route: home}]\n' },
        ], 't')
        expect(m.definitions).toEqual({})
        expect(m.actions).toEqual([{ id: 'go', commands: [{ targetComponentId: null, type: 'NavigateTo', data: 'home' }] }])
        expect(buildBundleManifest([], 't').actions).toBeUndefined()
    })

    it('normalises the route table to what the runtime reads (found: a layout: route exported to nothing)', () => {
        const m = buildBundleManifest([
            { path: 'routes.yaml', content: 'type: Routes\nroutes:\n  - route: ""\n    layout: app.yaml\n  - route: orders\n    layout: orders/list.yaml\n    data: orders-src\n' },
            { path: 'app.yaml', content: 'type: AppShell\ntitle: Shop\n' },
            { path: 'orders/list.yaml', content: 'type: Listing\ntitle: Orders\n' },
        ], 't')
        expect(m.routes?.routes).toEqual([
            { route: '', definition: 'app.yaml' },
            { route: 'orders', definition: 'orders/list.yaml', data: { ref: 'orders-src' } },
        ])
        expect(Object.keys(m.definitions).sort()).toEqual(['app.yaml', 'orders/list.yaml'])
        expect((m as unknown as Record<string, unknown>).mockSources).toBeUndefined()
    })

    it('tolerates an unparseable file and an empty project', () => {
        const m = buildBundleManifest([{ path: 'broken.yaml', content: ': : [' }], 't')
        expect(m.definitions).toEqual({})
        expect(buildBundleManifest([], 't').routes?.routes ?? []).toEqual([])
    })
})
