import { describe, it, expect } from 'vitest'
import { buildPlayManifest, filesDeclareAccess, withEdited } from './playManifest'

describe('buildPlayManifest', () => {
    const files = [
        { path: 'shop.ui.yaml', content: 'type: UI\nbasePath: /\nroutes: [routes.yaml]\n' },
        { path: 'routes.yaml', content: 'type: Routes\nroutes:\n  - {route: "", definition: app.yaml}\n  - route: orders\n    layout: orders.yaml\n    data: orders-src\n    children:\n      - {route: lines, layout: lines.yaml, data: {ref: lines-src}}\n  - {route: legacy, viewModel: com.acme.Legacy}\n' },
        { path: 'specs/ui/app.yaml', content: 'type: AppShell\ntitle: Shop\n' },
        { path: 'orders.yaml', content: 'type: Listing\ntitle: Orders\n' },
        { path: 'lines.yaml', content: 'type: Form\n' },
        { path: 'sources.yaml', content: 'type: Sources\nsources:\n  - {name: orders-src, source: {url: /o}}\n' },
    ]
    const m = buildPlayManifest(files, 'now')

    it('flattens the route tree to absolute routes, reading `layout:` as the definition', () => {
        expect(m.routes.routes).toEqual([
            { route: '', definition: 'app.yaml' },
            { route: 'orders', definition: 'orders.yaml', data: { ref: 'orders-src' } },
            { route: 'orders/lines', definition: 'lines.yaml', data: { ref: 'lines-src' } },
            { route: 'legacy', viewModel: 'com.acme.Legacy' },
        ])
    })
    it('ships every definition by its path — the app shell too — and the source catalogue apart', () => {
        expect(Object.keys(m.definitions).sort()).toEqual(['app.yaml', 'lines.yaml', 'orders.yaml'])
        expect(m.sources).toEqual({ sources: [{ name: 'orders-src', source: { url: '/o' } }] })
    })
})

describe('withEdited', () => {
    const files = [{ path: 'a.yaml', content: 'old' }, { path: 'b.yaml', content: 'b' }]
    it('lays the edited text over the saved copy', () => {
        expect(withEdited(files, 'specs/ui/a.yaml', 'new')).toEqual([{ path: 'a.yaml', content: 'new' }, { path: 'b.yaml', content: 'b' }])
    })
    it('adds the edited file when the mount does not have it yet, and leaves the files alone with nothing edited', () => {
        expect(withEdited(files, 'c.yaml', 'c')).toHaveLength(3)
        expect(withEdited(files, undefined, 'x')).toBe(files)
    })
})

describe('buildPlayManifest: translations, environments, access', () => {
    const files = [
        { path: 'translations/es.yaml', content: 'messages:\n  title: Pedidos\n' },
        { path: 'en.yaml', content: 'type: Translations\nlocale: en\nmessages: {title: Orders}\n' },
        { path: 'environments/pre.yaml', content: 'sources:\n  orders: {baseUrl: https://pre}\n' },
        { path: 'orders.yaml', content: 'type: VerticalLayout\ncontent:\n  - {type: Text, text: "${i18n.title}", eyesOnly: {roles: [admin]}}\n' },
    ]

    it('ships the catalogues as translations and keeps them and the environments out of the definitions', () => {
        const m = buildPlayManifest(files, 'now')
        expect(m.translations).toEqual({ es: { title: 'Pedidos' }, en: { title: 'Orders' } })
        expect(Object.keys(m.definitions)).toEqual(['orders.yaml'])
    })

    it('notices access rules (cosmetic in Play)', () => {
        expect(filesDeclareAccess(files)).toBe(true)
        expect(filesDeclareAccess([files[0]])).toBe(false)
        expect(filesDeclareAccess([{ path: 'r.yaml', content: 'routes:\n  - route: x\n    access: {roles: [a]}\n' }])).toBe(true)
    })
})
