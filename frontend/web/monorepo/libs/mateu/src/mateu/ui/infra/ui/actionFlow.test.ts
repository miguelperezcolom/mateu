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
})
