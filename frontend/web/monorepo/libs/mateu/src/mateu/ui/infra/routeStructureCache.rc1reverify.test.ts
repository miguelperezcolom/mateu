// @vitest-environment jsdom
// rc.1 re-verification of GA review 2 N-7: the route-structure cache still crosses users in one tab.
// A composed page (a Dashboard's MetricCards, the shell's per-caller menu) carries its values in the
// STRUCTURE, not in initialData, so structureOf() keeps them and they are written to sessionStorage.
// Same tab, same app, same build: a cookie sign-out + sign-in (no 401, no token change, no idle
// sign-out — none of the three wipes) and the next user is painted the previous user's tiles.
// it.fails at rc.1; fixed for rc.2: such a sign-in reaches the page as a fresh NAVIGATION, and a
// document reached that way starts with nothing the tab kept (a reload or back/forward still does).
import { describe, expect, it, vi } from 'vitest'

const KEY_PARTS = { baseUrl: '', consumedRoute: '', route: '/dashboard', serverSideType: undefined }
const managersDashboard = {
    type: 'ServerSide', id: 'd', serverSideType: 'x.Dashboard',
    children: [{ type: 'ClientSide', metadata: { type: 'MetricCard', title: 'Payroll', value: '€ 1,234,567 (manager only)' } }],
}

describe('rc.1 re-verify N-7: structure cache and a second user in the same tab', () => {
    const reachedBy = (type: string) =>
        vi.spyOn(performance, 'getEntriesByType').mockReturnValue([{ type } as unknown as PerformanceEntry])

    it('the page a cookie sign-out + sign-in lands on does not paint the previous user\'s values', async () => {
        sessionStorage.clear()
        // the manager's page load
        let cache = await import('./routeStructureCache')
        const key = cache.structureCacheKey(KEY_PARTS)
        cache.putCachedStructure(key, managersDashboard as never, 'h1')
        // sign-out + sign-in by form login = new page loads in the same tab (module state gone,
        // sessionStorage kept)
        vi.resetModules()
        const spy = reachedBy('navigate')
        cache = await import('./routeStructureCache')
        const seen = cache.getCachedStructure(cache.structureCacheKey(KEY_PARTS))
        spy.mockRestore()
        expect(JSON.stringify(seen ?? null)).not.toContain('manager only')
    })

    it('a reload or a back/forward of the same session still paints what the tab kept', async () => {
        for (const type of ['reload', 'back_forward']) {
            sessionStorage.clear()
            vi.resetModules()
            let cache = await import('./routeStructureCache')
            cache.putCachedStructure(cache.structureCacheKey(KEY_PARTS), managersDashboard as never, 'h1')
            vi.resetModules()
            const spy = reachedBy(type)
            cache = await import('./routeStructureCache')
            const seen = cache.getCachedStructure(cache.structureCacheKey(KEY_PARTS))
            spy.mockRestore()
            expect(seen?.hash, type).toBe('h1')
        }
    })

    it('a browser that does not say how the page was reached keeps it', async () => {
        const cache = await import('./routeStructureCache')
        const spy = vi.spyOn(performance, 'getEntriesByType').mockImplementation(() => { throw new Error('no') })
        expect(cache.documentNavigationType()).toBeUndefined()
        spy.mockRestore()
    })
})
