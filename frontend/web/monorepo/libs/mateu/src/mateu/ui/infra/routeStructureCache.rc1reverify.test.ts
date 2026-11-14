// @vitest-environment jsdom
// rc.1 re-verification of GA review 2 N-7: the route-structure cache still crosses users in one tab.
// A composed page (a Dashboard's MetricCards, the shell's per-caller menu) carries its values in the
// STRUCTURE, not in initialData, so structureOf() keeps them and they are written to sessionStorage.
// Same tab, same app, same build: a cookie sign-out + sign-in (no 401, no token change, no idle
// sign-out — none of the three wipes) and the next user is painted the previous user's tiles.
// NOT FIXED at rc.1: pinned with it.fails.
import { describe, expect, it, vi } from 'vitest'

const KEY_PARTS = { baseUrl: '', consumedRoute: '', route: '/dashboard', serverSideType: undefined }
const managersDashboard = {
    type: 'ServerSide', id: 'd', serverSideType: 'x.Dashboard',
    children: [{ type: 'ClientSide', metadata: { type: 'MetricCard', title: 'Payroll', value: '€ 1,234,567 (manager only)' } }],
}

describe('rc.1 re-verify N-7: structure cache and a second user in the same tab', () => {
    it.fails('a page reload after a cookie sign-out + sign-in does not paint the previous user\'s values', async () => {
        sessionStorage.clear()
        // the manager's page load
        let cache = await import('./routeStructureCache')
        const key = cache.structureCacheKey(KEY_PARTS)
        cache.putCachedStructure(key, managersDashboard as never, 'h1')
        // sign-out + sign-in by form login = new page loads in the same tab (module state gone,
        // sessionStorage kept)
        vi.resetModules()
        cache = await import('./routeStructureCache')
        const seen = cache.getCachedStructure(cache.structureCacheKey(KEY_PARTS))
        expect(JSON.stringify(seen ?? null)).not.toContain('manager only')
    })
})
