import { describe, expect, it } from 'vitest'
import { inAppRoute, shellActionTarget, shellFlowFor } from './shellFlows'

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

describe('shell actions — who runs the action a menu leaf names', () => {
    const flow = { id: 'newOrder', commands: [{ type: 'NavigateTo', data: 'orders/new' }] }
    const restCall = { id: 'refreshCache', restAction: { source: { url: '/api/refresh' } } }
    const app = {
        actions: [flow as never, { id: 'approve' } as never],
        actionCatalogue: [restCall as never],
    }

    it('a declared flow runs in the browser', () => {
        expect(shellActionTarget(app, 'newOrder')).toBe('flow')
    })

    it('a catalogue entry without steps is the on-screen component\'s (a REST call)', () => {
        expect(shellActionTarget(app, 'refreshCache')).toBe('component')
    })

    it('the shell\'s own step-less action and an id nobody declares are the APP\'s', () => {
        // a @Menu Rule leaf of a @UI class names a method of the app: it used to be sent to the
        // on-screen component, which does not advertise it, and the click did nothing
        expect(shellActionTarget(app, 'approve')).toBe('app')
        expect(shellActionTarget(app, 'ping')).toBe('app')
        expect(shellActionTarget(undefined, 'ping')).toBe('app')
    })
})
