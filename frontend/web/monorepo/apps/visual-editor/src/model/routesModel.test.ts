import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import {
    isRoutesYaml, parseRoutes, serializeRoutes, parseParams, formatParams,
} from './routesModel'

describe('isRoutesYaml', () => {
    it('recognises type: Routes, a routes: envelope and a bare list', () => {
        expect(isRoutesYaml('type: Routes\nroutes:\n  - route: a\n')).toBe(true)
        expect(isRoutesYaml('routes:\n  - route: a\n')).toBe(true)
        expect(isRoutesYaml('- route: a\n- route: b\n')).toBe(true)
    })
    it('rejects pages, partials, mounts and app shells', () => {
        expect(isRoutesYaml('type: VerticalLayout\ncontent: []\n')).toBe(false)
        expect(isRoutesYaml('content:\n  - type: Text\n')).toBe(false)
        expect(isRoutesYaml('type: UI\nbasePath: /\nroutes:\n  - r.yaml\n')).toBe(false)
        expect(isRoutesYaml('type: AppShell\ntitle: X\n')).toBe(false)
    })
})

describe('parse/serialize routes', () => {
    const src = `$schema: https://mateu.io/uidl/routes-schema.json
type: Routes
routes:
  - route: orders
    definition: orders.yaml
  - route: orders/:id
    viewModel: com.acme.Order
    fixedParams:
      status: open
`

    it('reads the entries and preserves the $schema preamble', () => {
        const doc = parseRoutes(src)
        expect(doc.routes.map((r) => r.route)).toEqual(['orders', 'orders/:id'])
        expect(doc.routes[0].definition).toBe('orders.yaml')
        expect(doc.routes[1].viewModel).toBe('com.acme.Order')
        expect(doc.routes[1].fixedParams).toEqual({ status: 'open' })
        expect((doc.preamble as any).$schema).toContain('routes-schema.json')
    })

    it('round-trips as a type: Routes envelope, keeping $schema and omitting empty fields', () => {
        const out = parse(serializeRoutes(parseRoutes(src)))
        expect(out.type).toBe('Routes')
        expect(out.$schema).toContain('routes-schema.json')
        expect(out.routes[0]).toEqual({ route: 'orders', definition: 'orders.yaml' }) // no empty viewModel
        expect(out.routes[1].fixedParams).toEqual({ status: 'open' })
    })

    it('a bare list is normalised to a type: Routes envelope', () => {
        const out = parse(serializeRoutes(parseRoutes('- route: a\n  viewModel: X\n')))
        expect(out.type).toBe('Routes')
        expect(out.routes[0]).toEqual({ route: 'a', viewModel: 'X' })
    })

    it('parses and formats param maps', () => {
        expect(parseParams('status=open, page=1, live=true')).toEqual({ status: 'open', page: 1, live: true })
        expect(formatParams({ status: 'open', page: 1 })).toBe('status=open, page=1')
        expect(parseParams('')).toEqual({})
    })
})
