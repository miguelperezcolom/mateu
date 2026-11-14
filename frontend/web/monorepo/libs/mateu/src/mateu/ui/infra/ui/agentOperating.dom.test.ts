// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    agentOperating, noteAgentQuery, OPERATING_MS, resetAgentOperating, setAgentStopHandler, stopOperating,
    subscribeAgentOperating,
} from './agentOperating'

/**
 * While an agent operates the tab, a non-modal notice says so with Stop; it goes after the agent's
 * last query has aged {@link OPERATING_MS}, or when the user stops it.
 */

const notice = () => document.body.querySelector('mateu-agent-operating') as (HTMLElement & { updateComplete?: Promise<unknown> }) | null

const until = async (check: () => boolean) => {
    for (let i = 0; i < 100 && !check(); i++) await new Promise(r => setTimeout(r, 10))
}

afterEach(() => {
    vi.useRealTimers()
    resetAgentOperating()
    setAgentStopHandler(() => undefined)
    document.body.innerHTML = ''
})

describe('an agent operating the tab', () => {
    it('shows the notice from the first query; Stop runs the channel’s handler and removes it', async () => {
        const states: boolean[] = []
        const unsubscribe = subscribeAgentOperating(on => states.push(on))
        subscribeAgentOperating(on => { if (on) throw new Error('a listener’s bug is its own') })
        let stopped = 0
        setAgentStopHandler(async () => { stopped++ })
        noteAgentQuery()
        noteAgentQuery()
        expect(agentOperating()).toBe(true)
        await until(() => !!notice())
        const el = notice()!
        await el.updateComplete
        const stop = el.shadowRoot!.querySelector('button.stop') as HTMLButtonElement
        expect(el.shadowRoot!.querySelector('[role="status"]')).not.toBeNull()
        stop.click()
        stop.click() // a second press while stopping does nothing more
        await until(() => stopped > 0 && !notice())
        expect(stopped).toBe(1)
        expect(agentOperating()).toBe(false)
        expect(notice()).toBeNull()
        unsubscribe()
        noteAgentQuery()
        expect(states).toEqual([false, true, false])
    })

    it('ends on its own once the last query has aged', () => {
        vi.useFakeTimers()
        noteAgentQuery()
        vi.advanceTimersByTime(OPERATING_MS - 1)
        noteAgentQuery() // a new query restarts the clock
        vi.advanceTimersByTime(OPERATING_MS - 1)
        expect(agentOperating()).toBe(true)
        vi.advanceTimersByTime(2)
        expect(agentOperating()).toBe(false)
        stopOperating()
        expect(agentOperating()).toBe(false)
    })
})
