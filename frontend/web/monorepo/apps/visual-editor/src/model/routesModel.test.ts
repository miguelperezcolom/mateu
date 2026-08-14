import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import {
    isRoutesYaml, parseRoutes, serializeRoutes, parseParams, formatParams,
} from './routesModel'

describe('isRoutesYaml', () => {
    it('recognises a routes: envelope and a bare list', () => {
        expect(isRoutesYaml('routes:\n  - route: a\n')).toBe(true)
        expect(isRoutesYaml('- route: a\n- route: b\n')).toBe(true)
    })
    it('rejects pages and partials', () => {
        expect(isRoutesYaml('type: VerticalLayout\ncontent: []\n')).toBe(false)
        expect(isRoutesYaml('content:\n  - type: Text\n')).toBe(false)
        expect(isRoutesYaml('layout:\n  type: FormLayout\n')).toBe(false)
    })
})

describe('parse/serialize routes', () => {
    const src = `app:
  title: Back office
  menu:
    - type: RouteLink
      label: Orders
      route: orders
routes:
  - route: orders
    definition: orders.yaml
  - route: orders/:id
    viewModel: com.acme.Order
    fixedParams:
      status: open
`

    it('reads the entries and preserves the app: preamble', () => {
        const doc = parseRoutes(src)
        expect(doc.enveloped).toBe(true)
        expect(doc.routes.map((r) => r.route)).toEqual(['orders', 'orders/:id'])
        expect(doc.routes[0].definition).toBe('orders.yaml')
        expect(doc.routes[1].viewModel).toBe('com.acme.Order')
        expect(doc.routes[1].fixedParams).toEqual({ status: 'open' })
        expect((doc.preamble as any).app.title).toBe('Back office')
    })

    it('round-trips, keeping the app: block untouched and omitting empty fields', () => {
        const out = parse(serializeRoutes(parseRoutes(src)))
        expect(out.app.title).toBe('Back office')
        expect(out.app.menu[0].route).toBe('orders')
        expect(out.routes[0]).toEqual({ route: 'orders', definition: 'orders.yaml' }) // no empty viewModel
        expect(out.routes[1].fixedParams).toEqual({ status: 'open' })
    })

    it('keeps a bare list a bare list', () => {
        const out = parse(serializeRoutes(parseRoutes('- route: a\n  viewModel: X\n')))
        expect(Array.isArray(out)).toBe(true)
        expect(out[0]).toEqual({ route: 'a', viewModel: 'X' })
    })

    it('parses and formats param maps', () => {
        expect(parseParams('status=open, page=1, live=true')).toEqual({ status: 'open', page: 1, live: true })
        expect(formatParams({ status: 'open', page: 1 })).toBe('status=open, page=1')
        expect(parseParams('')).toEqual({})
    })
})
