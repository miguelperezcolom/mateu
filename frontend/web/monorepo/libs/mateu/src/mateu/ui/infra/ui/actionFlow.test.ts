import { describe, expect, it, vi } from 'vitest'
import { runDeclaredFlow } from './flowRunner'

/**
 * A declared client-side flow (coherence-plan #3): an action that carries `commands` (lowered from
 * fluent Steps on the server) runs them with the component's command applier and reports that it
 * handled the action, so the caller skips the server dispatch. This pins the client half of the
 * flow model — the server half is ActionFlowSyncTest.
 */
describe('runDeclaredFlow', () => {

    it('applies every command in order and reports it handled the action', () => {
        const apply = vi.fn()
        const handled = runDeclaredFlow(
            {
                commands: [
                    { targetComponentId: null, type: 'MarkAsClean', data: null },
                    { targetComponentId: null, type: 'CloseModal', data: { eventName: 'saved' } },
                    { targetComponentId: null, type: 'NavigateTo', data: '/orders' },
                ],
            } as any,
            apply,
        )
        expect(handled).toBe(true)
        expect(apply).toHaveBeenCalledTimes(3)
        expect(apply.mock.calls.map(c => c[0].type)).toEqual(['MarkAsClean', 'CloseModal', 'NavigateTo'])
    })

    it('does not handle a normal action (no commands) — the caller falls through to the server', () => {
        const apply = vi.fn()
        expect(runDeclaredFlow({ id: 'plain' } as any, apply)).toBe(false)
        expect(runDeclaredFlow(undefined, apply)).toBe(false)
        expect(runDeclaredFlow({ commands: [] } as any, apply)).toBe(false)
        expect(apply).not.toHaveBeenCalled()
    })

    it('a Navigate route reads the state and the action parameters (a map marker opens its record)', () => {
        const apply = vi.fn()
        runDeclaredFlow(
            { commands: [{ targetComponentId: null, type: 'NavigateTo', data: 'launch-sites/${state._markerId}' }] } as any,
            apply,
            { state: { name: 'x' }, parameters: { _markerId: 'KSC 39A' } },
        )
        // encoded as a path segment, like a source url
        expect(apply.mock.calls[0][0].data).toBe('launch-sites/KSC%2039A')
    })

    it('a Navigate route without placeholders, or without a context, is applied as written', () => {
        const apply = vi.fn()
        runDeclaredFlow({ commands: [{ targetComponentId: null, type: 'NavigateTo', data: '/orders' }] } as any, apply, { state: {} })
        runDeclaredFlow({ commands: [{ targetComponentId: null, type: 'NavigateTo', data: 'x/${state.id}' }] } as any, apply)
        expect(apply.mock.calls.map(c => c[0].data)).toEqual(['/orders', 'x/${state.id}'])
    })
})
