// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn(() => Promise.resolve())
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuApiClient: { runAction: (...a: unknown[]) => runAction(...(a as [])) } }))
const announce = vi.fn()
vi.mock('@infra/a11y/announcer.ts', () => ({ announce: (...a: unknown[]) => announce(...(a as [])) }))

import './mateu-idle-warning'
import type { MateuIdleWarning } from './mateu-idle-warning'
import { ACTIVITY_KEY, SIGN_OUT_KEY } from './idleSession'

const app = (idle: Record<string, unknown> | undefined) => ({
    rootRoute: '/app', serverSideType: 'com.example.App',
    idleSession: idle && { timeoutSeconds: 60, warningSeconds: 20, keepAliveActionId: '_keep-alive', signOutUrl: '/logout', ...idle },
}) as any

let signOuts: CustomEvent[] = []
const onSignOut = (e: Event) => { e.preventDefault(); signOuts.push(e as CustomEvent) }

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    vi.setSystemTime(new Date('2026-10-17T10:00:00Z'))
    localStorage.clear()
    signOuts = []
    runAction.mockClear(); announce.mockClear()
    document.addEventListener('mateu-idle-sign-out', onSignOut)
})
afterEach(() => {
    document.removeEventListener('mateu-idle-sign-out', onSignOut)
    document.body.innerHTML = ''
    localStorage.clear()
    vi.useRealTimers()
})

async function mount(idle: Record<string, unknown> | undefined = {}) {
    const el = document.createElement('mateu-idle-warning') as MateuIdleWarning
    el.app = app(idle)
    el.baseUrl = '/base'
    document.body.appendChild(el)
    await el.updateComplete
    return el
}
const advance = async (el: MateuIdleWarning, seconds: number) => { vi.advanceTimersByTime(seconds * 1000); await el.updateComplete }
const dialog = (el: MateuIdleWarning) => el.shadowRoot!.querySelector('[role="alertdialog"]') as HTMLElement | null

describe('idle-session warning', () => {
    it('stays hidden while the user is active, and writes the shared activity mark', async () => {
        const el = await mount()
        expect(localStorage.getItem(ACTIVITY_KEY)).toBe(String(Date.now()))
        await advance(el, 30)
        expect(dialog(el)).toBeNull()
    })

    it('does nothing for an app without idle timeout', async () => {
        const el = await mount(null as any)
        await advance(el, 3600)
        expect(dialog(el)).toBeNull()
        expect(signOuts).toHaveLength(0)
    })

    it('counts down in an alert dialog, focusing "Stay signed in", announcing the last 10 seconds once', async () => {
        const el = await mount()
        await advance(el, 41)
        const d = dialog(el)!
        expect(d.getAttribute('aria-modal')).toBe('true')
        expect(d.querySelector('#idle-message')!.textContent).toContain('19 seconds')
        // the trap moves the focus on the next frame
        await vi.waitFor(() => expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.stay')))
        expect(announce).not.toHaveBeenCalled()
        await advance(el, 10)
        expect(announce).toHaveBeenCalledTimes(1)
        expect(announce.mock.calls[0][1]).toEqual({ politeness: 'assertive' })
        await advance(el, 2)
        expect(announce).toHaveBeenCalledTimes(1)
    })

    it('ignores stray activity while the warning is up', async () => {
        const el = await mount()
        await advance(el, 45)
        window.dispatchEvent(new Event('pointerdown'))
        await advance(el, 1)
        expect(dialog(el)).toBeTruthy()
    })

    it('"Stay signed in" keeps the session alive on the server and dismisses the warning', async () => {
        const el = await mount()
        await advance(el, 45)
        ;(el.shadowRoot!.querySelector('.stay') as HTMLButtonElement).click()
        await el.updateComplete
        expect(dialog(el)).toBeNull()
        expect(runAction).toHaveBeenCalledTimes(1)
        expect((runAction.mock.calls[0] as unknown[]).slice(0, 7)).toEqual(['/base', '/app', '', '_keep-alive', 'idle-warning', undefined, 'com.example.App'])
        expect(localStorage.getItem(ACTIVITY_KEY)).toBe(String(Date.now()))
    })

    it('Escape counts as staying', async () => {
        const el = await mount()
        await advance(el, 45)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
        await el.updateComplete
        expect(dialog(el)).toBeNull()
        expect(runAction).toHaveBeenCalled()
    })

    it('"Sign out" tells the other tabs and offers the app a cancelable sign-out event with the url', async () => {
        const el = await mount()
        await advance(el, 45)
        ;(el.shadowRoot!.querySelector('.out') as HTMLButtonElement).click()
        await el.updateComplete
        expect(signOuts).toHaveLength(1)
        expect(signOuts[0].detail).toEqual({ url: '/logout' })
        expect(localStorage.getItem(SIGN_OUT_KEY)).toBeTruthy()
        expect(dialog(el)!.textContent).toContain('Signing out')
        expect(el.shadowRoot!.querySelector('.stay')).toBeNull()
    })

    it('MINOR 4: a javascript: sign-out url is never followed — it signs out to /', async () => {
        const el = await mount({ signOutUrl: 'javascript:alert(document.cookie)' })
        await advance(el, 61)
        expect(signOuts).toHaveLength(1)
        expect(signOuts[0].detail.url).toBe('/')
    })

    it('signs out by itself when the countdown reaches zero, once', async () => {
        const el = await mount({ signOutUrl: null })
        await advance(el, 61)
        await advance(el, 5)
        expect(signOuts).toHaveLength(1)
        expect(signOuts[0].detail.url).toBe('/')
    })

    it('follows the other tabs: their activity resets the countdown, their sign-out signs this one out', async () => {
        const el = await mount()
        await advance(el, 45)
        localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
        window.dispatchEvent(new StorageEvent('storage', { key: ACTIVITY_KEY, newValue: String(Date.now()) }))
        await el.updateComplete
        expect(dialog(el)).toBeNull()
        window.dispatchEvent(new StorageEvent('storage', { key: SIGN_OUT_KEY, newValue: '1' }))
        await el.updateComplete
        expect(signOuts).toHaveLength(1)
        // propagated from another tab: not written back
        expect(localStorage.getItem(SIGN_OUT_KEY)).toBeNull()
    })

    it('stops listening when removed', async () => {
        const el = await mount()
        el.remove()
        vi.advanceTimersByTime(120_000)
        expect(signOuts).toHaveLength(0)
    })
})
