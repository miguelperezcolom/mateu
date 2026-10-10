import { describe, expect, it } from 'vitest'
import { inAppRoute, shellFlowFor } from './shellFlows'

describe('shell flows — the menu leaf that runs a declared flow', () => {
    const app = {
        actions: [
            { id: 'newOrder', commands: [{ targetComponentId: '', type: 'NavigateTo', data: 'orders/new' }] },
            { id: 'serverSide' },
        ],
    } as any

    it('finds the lowered commands of a flow the shell declares', () => {
        expect(shellFlowFor(app, 'newOrder')).toHaveLength(1)
    })

    it('answers nothing for an action without a flow, or one the shell does not declare', () => {
        expect(shellFlowFor(app, 'serverSide')).toBeUndefined()
        expect(shellFlowFor(app, 'unknown')).toBeUndefined()
        expect(shellFlowFor(undefined, 'newOrder')).toBeUndefined()
        expect(shellFlowFor({}, 'newOrder')).toBeUndefined()
    })

    it('treats a path as a route of the app and a URL as leaving it', () => {
        expect(inAppRoute('orders/new')).toBe('orders/new')
        expect(inAppRoute('/orders/new')).toBe('orders/new')
        expect(inAppRoute('https://example.com')).toBeUndefined()
        expect(inAppRoute('//evil.com/x')).toBeUndefined()
        expect(inAppRoute('mailto:a@b.c')).toBeUndefined()
        expect(inAppRoute(undefined)).toBeUndefined()
    })
})
