import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse } from 'yaml'
import { templateText, templatesRoot } from './newFiles'
import {
    DOCS_URL,
    appendRoute,
    classify,
    existingRoutes,
    homeOf,
    mountListing,
    mountOf,
    ofKind,
    registerInMount,
    relativePath,
    routeNameOf,
    routesFileText,
    scanSpecs,
    setHome,
    specsRoot,
} from './routesWizard'

// Mirrors the IntelliJ plugin's MateuRoutesTest.
const repo = join(__dirname, '..', '..', '..', '..')
const routesSchema = JSON.parse(readFileSync(join(repo, 'backend/shared/uidl/routes-schema.json'), 'utf8'))
const routeEntryKeys = new Set(Object.keys(routesSchema.$defs.RouteEntry.properties))
const routesFileKeys = new Set(Object.keys(routesSchema.oneOf[0].properties))

/** The generated file is a valid route file: its keys are those routes-schema.json declares. */
function assertValidRoutes(text: string): any {
    const doc = parse(text)
    for (const k of Object.keys(doc)) expect(routesFileKeys.has(k), `top-level key ${k}`).toBe(true)
    expect(doc.type).toBe('Routes')
    expect(Array.isArray(doc.routes)).toBe(true)
    for (const e of doc.routes) {
        for (const k of Object.keys(e)) expect(routeEntryKeys.has(k), `RouteEntry key ${k}`).toBe(true)
        expect(typeof e.route).toBe('string')
    }
    return doc
}

describe('classify', () => {
    it('reads the top-level type', () => {
        expect(classify('type: UI\nbasePath: /\n')).toBe('mount')
        expect(classify('type: Routes\nroutes: []\n')).toBe('routes')
        expect(classify('type: Sources\nsources: []\n')).toBe('sources')
        expect(classify('type: Actions\nactions: []\n')).toBe('actions')
        expect(classify('type: AppShell\ntitle: x\n')).toBe('appShell')
        expect(classify('type: Form\ntitle: x\n')).toBe('page')
        expect(classify('title: no type\n')).toBe('page')
    })
    it('skips what does not parse or is not a mapping', () => {
        expect(classify('type: [unclosed\n  - : :')).toBeNull()
        expect(classify('- a\n- b\n')).toBeNull()
    })
})

describe('names and paths', () => {
    it('derives routes and relative paths', () => {
        expect(routeNameOf('customerOrders.yaml')).toBe('customer-orders')
        expect(routeNameOf('sales/order_list.yml')).toBe('sales/order-list')
        expect(routeNameOf('home.yaml')).toBe('home')
        expect(relativePath('', 'routes.yaml')).toBe('routes.yaml')
        expect(relativePath('apps', 'routes.yaml')).toBe('../routes.yaml')
        expect(relativePath('', 'shop/routes.yaml')).toBe('shop/routes.yaml')
        expect(specsRoot('/p/src/main/resources/specs/ui/sales')).toBe('/p/src/main/resources/specs/ui')
        expect(specsRoot('/p/src/main/resources/specs/ui')).toBe('/p/src/main/resources/specs/ui')
    })
})

describe('a new routes file', () => {
    it('is empty, valid and points at the docs', () => {
        const text = routesFileText()
        const doc = assertValidRoutes(text)
        expect(doc.routes).toEqual([])
        expect(text).toContain(DOCS_URL)
        expect(text).not.toContain('.yaml')
        expect(parse(routesFileText('/shop')).basePath).toBe('/shop')
    })
    it('is the bundled Mateu Routes template', () => {
        expect(templateText(templatesRoot(join(__dirname, '..')).internal, 'Mateu Routes')).toBe(routesFileText())
    })
})

describe('appendRoute', () => {
    it('turns an empty flow list into a block list', () => {
        const text = appendRoute(routesFileText(), { route: 'orders', layout: 'orders.yaml', viewModel: 'com.acme.Orders' })
        expect(text.endsWith('routes:\n  - route: orders\n    layout: orders.yaml\n    viewModel: com.acme.Orders\n')).toBe(true)
        expect(assertValidRoutes(text).routes[0].layout).toBe('orders.yaml')
    })

    it('appends to a block list keeping the rest of the file', () => {
        const original = '# my routes\ntype: Routes\nroutes:\n- route: ""\n  layout: app.yaml # shell\n\n# trailing note\n'
        const text = appendRoute(original, { route: 'about', layout: 'about.yaml' })
        expect(text).toBe(
            '# my routes\ntype: Routes\nroutes:\n- route: ""\n  layout: app.yaml # shell\n- route: about\n  layout: about.yaml\n\n# trailing note\n',
        )
        assertValidRoutes(text)
        expect(existingRoutes(text)).toEqual(['', 'about'])
    })

    it('emits the root route and parent', () => {
        let text = appendRoute(routesFileText(), { route: '', layout: 'app.yaml' })
        text = appendRoute(text, { route: 'customers/:id', layout: 'customer.yaml' })
        text = appendRoute(text, { route: 'customers/:id/profile', layout: 'profile.yaml', parent: 'customers/:id' })
        const doc = assertValidRoutes(text)
        expect(doc.routes[0].route).toBe('')
        expect(doc.routes[2].parent).toBe('customers/:id')
        expect(doc.routes[1].viewModel).toBeUndefined()
    })

    it('rejects a duplicate route', () => {
        const text = 'type: Routes\nroutes:\n  - route: orders\n    children:\n      - route: archived\n'
        expect(existingRoutes(text)).toEqual(['orders', 'orders/archived'])
        for (const r of ['orders', 'orders/archived', '/orders']) {
            expect(() => appendRoute(text, { route: r, layout: 'x.yaml' })).toThrow(/already declared/)
        }
    })

    it('appends to a non-empty flow list', () => {
        const text = appendRoute('type: Routes\nroutes: [{route: a}]\n', { route: 'b', layout: 'b.yaml' })
        expect(text).toBe('type: Routes\nroutes: [{route: a}, {route: b, layout: b.yaml}]\n')
        assertValidRoutes(text)
    })
})

describe('registerInMount', () => {
    const listed = 'type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n'
    it('leaves an already listed file alone', () => {
        expect(registerInMount(listed, 'routes.yaml')).toBe(listed)
        expect(registerInMount(listed, './routes.yaml')).toBe(listed)
    })
    it('appends to the list, adds the key, or expands []', () => {
        expect(registerInMount(listed, 'admin-routes.yaml')).toBe('type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n  - admin-routes.yaml\n')
        expect(registerInMount('type: UI\nbasePath: /shop\n', 'routes.yaml')).toBe('type: UI\nbasePath: /shop\nroutes:\n  - routes.yaml\n')
        expect(registerInMount('type: UI\nroutes: []\n', 'routes.yaml')).toBe('type: UI\nroutes:\n  - routes.yaml\n')
    })
})

describe('setHome', () => {
    it('inserts after basePath, replaces an existing home, or goes after type: UI', () => {
        expect(setHome('type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n', 'dashboard'))
            .toBe('type: UI\nbasePath: /\nhome: dashboard\nroutes:\n  - routes.yaml\n')
        expect(setHome('type: UI\nbasePath: /\nhome: dashboard\nroutes: []\n', 'orders'))
            .toBe('type: UI\nbasePath: /\nhome: orders\nroutes: []\n')
        expect(setHome('# mount\ntype: UI\nroutes: []\n', 'orders')).toBe('# mount\ntype: UI\nhome: orders\nroutes: []\n')
        expect(setHome('routes: []\n', 'orders')).toBe('home: orders\nroutes: []\n')
        expect(homeOf(setHome('type: UI\n', 'orders'))).toBe('orders')
        expect(setHome('type: UI\n', '')).toBe('type: UI\nhome: ""\n')
    })
})

describe('scanSpecs', () => {
    it('classifies a specs tree, skipping broken files, honouring unsaved content', () => {
        const dir = mkdtempSync(join(tmpdir(), 'mateu-specs-'))
        mkdirSync(join(dir, 'sales'))
        writeFileSync(join(dir, 'app.ui.yaml'), 'type: UI\nroutes:\n  - routes.yaml\n')
        writeFileSync(join(dir, 'routes.yaml'), 'type: Routes\nroutes: []\n')
        writeFileSync(join(dir, 'app.yaml'), 'type: AppShell\ntitle: x\n')
        writeFileSync(join(dir, 'sales/orders.yaml'), 'type: Form\n')
        writeFileSync(join(dir, 'broken.yaml'), 'type: [oops\n  - : :')
        writeFileSync(join(dir, 'notes.txt'), 'type: UI\n')
        const ws = scanSpecs(dir, (abs) => (abs.endsWith('/app.yaml') ? 'type: Form\n' : undefined))
        expect(ws.files).toEqual([
            { path: 'app.ui.yaml', kind: 'mount' },
            { path: 'app.yaml', kind: 'page' },
            { path: 'routes.yaml', kind: 'routes' },
            { path: 'sales/orders.yaml', kind: 'page' },
        ])
        expect(mountOf(ws, 'routes.yaml')).toBe('app.ui.yaml')
        expect(ofKind(ws, 'routes').map((f) => f.path)).toEqual(['routes.yaml'])
    })
})

describe('mountListing', () => {
    it('resolves entries against the mount directory', () => {
        const mounts = {
            'app.ui.yaml': 'type: UI\nroutes:\n  - routes.yaml\n',
            'shop/shop.ui.yaml': 'type: UI\nroutes:\n  - routes.yaml\n  - ../extra.yaml\n',
        }
        expect(mountListing(mounts, 'routes.yaml')).toBe('app.ui.yaml')
        expect(mountListing(mounts, 'shop/routes.yaml')).toBe('shop/shop.ui.yaml')
        expect(mountListing(mounts, 'extra.yaml')).toBe('shop/shop.ui.yaml')
        expect(mountListing(mounts, 'other.yaml')).toBeNull()
    })
})
