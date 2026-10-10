import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import { parseRoutes, serializeRoutes } from './routesModel'
import { parseApp, serializeApp } from './appModel'
import { formatAccessInline, parseAccessInline, readAccess, restricts, writeAccess } from './access'

describe('access (the YAML Access restriction)', () => {
    it('reads the object, the roles shorthand string and the roles shorthand list', () => {
        expect(readAccess({ roles: ['admin'], scopes: ['orders:write'] })).toEqual({ roles: ['admin'], scopes: ['orders:write'] })
        expect(readAccess('admin, hr')).toEqual({ roles: ['admin', 'hr'] })
        expect(readAccess(['admin'])).toEqual({ roles: ['admin'] })
        expect(readAccess(undefined)).toEqual({})
    })

    it('writes only the declared dimensions, and removes the key when none is', () => {
        expect(writeAccess({ roles: ['admin', ' ', 'admin'], groups: [] })).toEqual({ roles: ['admin'] })
        expect(writeAccess({ roles: [], groups: [] })).toBe('')
        expect(restricts({ permissions: ['x'] })).toBe(true)
        expect(restricts({})).toBe(false)
    })

    it('round-trips the one-line form: roles shorthand, or named dimensions', () => {
        expect(formatAccessInline({ roles: ['admin', 'hr'] })).toBe('admin, hr')
        expect(parseAccessInline('admin, hr')).toEqual({ roles: ['admin', 'hr'] })
        const both = { roles: ['manager'], scopes: ['orders:write', 'orders:read'] }
        expect(formatAccessInline(both)).toBe('roles=manager; scopes=orders:write,orders:read')
        expect(parseAccessInline(formatAccessInline(both))).toEqual(both)
        expect(parseAccessInline('  ')).toBe('')
        expect(parseAccessInline('nonsense=x')).toBe('')
    })
})

describe('access in the files the editors own', () => {
    it('a route keeps its access: through a parse/serialise round trip', () => {
        const doc = parseRoutes('routes:\n  - route: admin/users\n    layout: users.yaml\n    access: {roles: [admin]}\n')
        expect(doc.routes[0].extra?.access).toEqual({ roles: ['admin'] })
        doc.routes[0].extra = { access: parseAccessInline('roles=admin; groups=it') }
        expect(parse(serializeRoutes(doc)).routes[0].access).toEqual({ roles: ['admin'], groups: ['it'] })
    })

    it('a menu item keeps its access: through a parse/serialise round trip', () => {
        const app = parseApp('type: AppShell\ntitle: X\nmenu:\n  - {type: RouteLink, label: Users, route: admin/users, access: {roles: [admin]}}\n')
        const item = app.menu[0] as { extra: Record<string, unknown> }
        expect(item.extra.access).toEqual({ roles: ['admin'] })
        expect(parse(serializeApp(app)).menu[0].access).toEqual({ roles: ['admin'] })
    })
})
