// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuApiClient: { runAction: (...a: unknown[]) => runAction(...a) } }))
const announced: string[] = []
vi.mock('@infra/a11y/announcer.ts', () => ({ announce: (text: string) => { announced.push(text) } }))

import './mateu-agent-connect'
import type { MateuAgentConnect } from './mateu-agent-connect'
import type { MateuAgentConnectDialog } from './mateu-agent-connect-dialog'
import { agentsText, countdownText } from './mateu-agent-connect-dialog'
import { AGENT_SECRET_KEY, applyAgentPush, resetAgentChannel } from './agentChannel'

/**
 * "Connect AI" (live UI push): the header control asks the app for a pairing code, the dialog shows
 * it (large, copyable, with its countdown and what to tell the agent), the channel's status turns it
 * into "Connected to …" and the control into a connected indicator, and Disconnect unpairs. Pairing
 * and disconnection are announced; the dialog owns the focus and gives it back.
 */

const APP = { agentPush: true, serverSideType: 'com.example.Ops', rootRoute: 'ops' } as never

const status = (paired: boolean, agents: string[] = []) =>
    applyAgentPush(document.body, { kind: 'status', event: 'mateu-agent-status', detail: { paired, agents } })

const flush = async () => {
    for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 0))
        await new Promise((r) => requestAnimationFrame(() => r(undefined)))
    }
}

/** With faked intervals (jsdom's animation frames run on them): macrotasks only. */
const tick = async () => { for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0)) }

const mount = async () => {
    const el = document.createElement('mateu-agent-connect') as MateuAgentConnect
    el.app = APP
    el.baseUrl = '/base'
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const button = (el: MateuAgentConnect) => el.shadowRoot!.querySelector('button') as HTMLButtonElement
const dialog = () => document.querySelector('mateu-agent-connect-dialog') as MateuAgentConnectDialog | null
const $ = (d: MateuAgentConnectDialog, sel: string) => d.shadowRoot!.querySelector(sel) as HTMLElement | null

beforeEach(() => {
    document.documentElement.lang = 'en'
    runAction.mockReset()
    announced.length = 0
})

afterEach(() => {
    resetAgentChannel()
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe('mateu-agent-connect', () => {
    it('pairs: code shown → status paired → connected indicator → disconnect', async () => {
        runAction.mockImplementation((_b: string, _r: string, _c: string, actionId: string) => Promise.resolve(actionId === '_agent-pair'
            ? { fragments: [{ data: { _agentPairing: { code: 'K7QX-M2PA', expiresInSeconds: 125 } } }] }
            : { fragments: [{ data: { _agentPairing: null } }] }))
        const el = await mount()
        expect(button(el).textContent).toContain('Connect AI')
        expect(button(el).getAttribute('aria-pressed')).toBe('false')
        expect(button(el).getAttribute('aria-haspopup')).toBe('dialog')

        button(el).focus()
        button(el).click()
        await flush()
        const d = dialog()!
        expect(d).toBeTruthy()
        await d.updateComplete
        const panel = $(d, '[role="dialog"]')!
        expect(panel.getAttribute('aria-modal')).toBe('true')
        expect(panel.getAttribute('aria-labelledby')).toBe('agent-connect-title')
        expect($(d, '.code')!.textContent).toBe('K7QX-M2PA')
        expect($(d, '#agent-connect-desc')!.textContent).toContain('mateu_pair_session')
        expect($(d, '.countdown')!.textContent).toContain('2:05')
        // the pairing call names this tab's session and secret
        const [baseUrl, route, , actionId, , , serverSideType, , parameters] = runAction.mock.calls[0]
        expect([baseUrl, route, actionId, serverSideType]).toEqual(['/base', 'ops', '_agent-pair', 'com.example.Ops'])
        expect(parameters).toEqual({ sessionId: sessionStorage.getItem('__mateu_sesion_id'), secret: sessionStorage.getItem(AGENT_SECRET_KEY) })
        // the focus is in the dialog
        expect(d.shadowRoot!.activeElement).toBeTruthy()

        status(true, ['ana@example.com'])
        await d.updateComplete
        await el.updateComplete
        expect($(d, '.connected')!.textContent).toContain('Connected to ana@example.com')
        expect(button(el).getAttribute('aria-pressed')).toBe('true')
        expect(button(el).textContent).toContain('AI connected')
        expect(button(el).getAttribute('aria-label')).toContain('ana@example.com')
        expect(announced).toEqual(['Connected to ana@example.com'])

        ;($(d, '.disconnect') as HTMLButtonElement).click()
        await flush()
        expect(runAction.mock.calls.at(-1)![3]).toBe('_agent-unpair')
        expect(dialog()).toBeNull()
        await el.updateComplete
        expect(button(el).getAttribute('aria-pressed')).toBe('false')
        expect(announced.at(-1)).toBe('AI disconnected')
        // the focus came back to the header control
        expect(el.shadowRoot!.activeElement).toBe(button(el))
    })

    it('the connected indicator reopens the dialog on "Connected to …" without asking for a code', async () => {
        const el = await mount()
        status(true, [])
        await el.updateComplete
        expect(announced).toEqual(['Connected to an agent'])
        button(el).click()
        await flush()
        const d = dialog()!
        await d.updateComplete
        expect($(d, '.connected')!.textContent).toContain('Connected to an agent')
        expect(runAction).not.toHaveBeenCalled()
        // Escape closes it
        $(d, '[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }))
        expect(dialog()).toBeNull()
    })

    it('says when no code could be had, and retries; an expired code offers a new one', async () => {
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
        runAction.mockRejectedValueOnce(new Error('not registered'))
        runAction.mockResolvedValue({ fragments: [{ data: { _agentPairing: { code: 'AAAA-BBBB', expiresInSeconds: 2 } } }] })
        const el = await mount()
        const d = await el.open() as MateuAgentConnectDialog
        await tick()
        await d.updateComplete
        expect($(d, '[role="alert"]')!.textContent).toContain('Could not get a pairing code')
        ;($(d, '.primary') as HTMLButtonElement).click()
        await tick()
        await d.updateComplete
        expect($(d, '.code')!.textContent).toBe('AAAA-BBBB')

        vi.advanceTimersByTime(3_000)
        await d.updateComplete
        expect($(d, '#agent-connect-desc')!.textContent).toContain('expired')
        ;($(d, '.primary') as HTMLButtonElement).click()
        await tick()
        expect(runAction).toHaveBeenCalledTimes(3)
    })

    it('copies the code', async () => {
        const writeText = vi.fn(() => Promise.resolve())
        vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
        runAction.mockResolvedValue({ fragments: [{ data: { _agentPairing: { code: 'K7QX-M2PA', expiresInSeconds: 300 } } }] })
        const el = await mount()
        const d = await el.open() as MateuAgentConnectDialog
        await flush()
        await d.updateComplete
        ;($(d, '.copy') as HTMLButtonElement).click()
        await flush()
        expect(writeText).toHaveBeenCalledWith('K7QX-M2PA')
        expect($(d, '.copy')!.textContent).toContain('Code copied')
        expect(announced).toContain('Code copied')
    })

    it('formats the countdown and the agents', () => {
        expect(countdownText(300)).toBe('5:00')
        expect(countdownText(65)).toBe('1:05')
        expect(countdownText(-3)).toBe('0:00')
        expect(agentsText(['a', 'b'])).toBe('a, b')
        expect(agentsText([])).toBe('an agent')
    })
})
