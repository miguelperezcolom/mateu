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
        // definitions keyed by BASENAME; shell/mount/routes/sources are not definitions
        expect(Object.keys(m.definitions).sort()).toEqual(['about.yaml', 'person.yaml'])
        expect((m.definitions['about.yaml'] as any).type).toBe('VerticalLayout')
        expect(m.routes?.routes).toHaveLength(2)
        expect(m.sources?.sources).toHaveLength(1)
    })

    it('counts the routes that render with no backend (definition-only, classless)', () => {
        const m = buildBundleManifest(files, 't')
        // `about` is definition-only; `person` binds a viewModel → needs a backend
        expect(clientRenderableRouteCount(m)).toBe(1)
    })

    it('tolerates an unparseable file and an empty project', () => {
        const m = buildBundleManifest([{ path: 'broken.yaml', content: ': : [' }], 't')
        expect(m.definitions).toEqual({})
        expect(buildBundleManifest([], 't').routes).toBeUndefined()
    })
})
