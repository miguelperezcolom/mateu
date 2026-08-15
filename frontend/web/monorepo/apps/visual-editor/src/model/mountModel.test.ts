import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { isMountYaml, parseMount, serializeMount } from './mountModel'

const src = `type: UI
basePath: /back-office
routes:
  - orders-routes.yaml
  - shared-routes.yaml
`

describe('mountModel', () => {
    it('detects a type: UI mount descriptor', () => {
        expect(isMountYaml(src)).toBe(true)
        expect(isMountYaml('type: AppShell\ntitle: X\n')).toBe(false)
        expect(isMountYaml('routes:\n  - route: a\n')).toBe(false)
    })

    it('reads the base path and the ordered route files', () => {
        const doc = parseMount(src)
        expect(doc.basePath).toBe('/back-office')
        expect(doc.routeFiles).toEqual(['orders-routes.yaml', 'shared-routes.yaml'])
    })

    it('round-trips as a type: UI file', () => {
        const out = parse(serializeMount(parseMount(src)))
        expect(out.type).toBe('UI')
        expect(out.basePath).toBe('/back-office')
        expect(out.routes).toEqual(['orders-routes.yaml', 'shared-routes.yaml'])
    })

    it('edits base path and reorders route files', () => {
        const doc = parseMount(src)
        doc.basePath = '/bo'
        doc.routeFiles = ['shared-routes.yaml', 'orders-routes.yaml']
        const out = parse(serializeMount(doc))
        expect(out.basePath).toBe('/bo')
        expect(out.routes).toEqual(['shared-routes.yaml', 'orders-routes.yaml'])
    })
})
