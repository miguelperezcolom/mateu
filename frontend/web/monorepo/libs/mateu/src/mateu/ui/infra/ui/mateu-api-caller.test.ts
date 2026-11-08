// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const notified: unknown[] = []
vi.mock('@application/Notifier.ts', () => ({ notify: (toast: unknown) => notified.push(toast) }))
vi.mock('@infra/http/clientErrorReporter.ts', () => ({ reportClientError: () => {}, failureReportOf: () => ({}) }))

import './mateu-api-caller'
import type { MateuApiCaller } from './mateu-api-caller'

/**
 * A failing micro frontend (found building the Mateu Explorer, 3.0-beta.51): a remote that is down
 * raised the PAGE-wide "No connection" toast. An island's caller tells it inside its own box.
 */
const fail = (from: Element, failure: Record<string, unknown>, retry?: () => void) =>
    from.dispatchEvent(new CustomEvent('backend-failed-event', {
        bubbles: true, composed: true, detail: { actionId: '', failure, retry },
    }))

const mount = async (inline: boolean) => {
    const caller = document.createElement('mateu-api-caller') as MateuApiCaller
    if (inline) caller.setAttribute('inline-failures', '')
    const child = document.createElement('div')
    caller.appendChild(child)
    document.body.appendChild(caller)
    await caller.updateComplete
    return { caller, child }
}

afterEach(() => { document.body.innerHTML = ''; notified.length = 0 })

describe('mateu-api-caller', () => {
    it('an island tells a failure inside its own box — never as a page-wide toast', async () => {
        const { caller, child } = await mount(true)
        const retry = vi.fn()
        fail(child, { kind: 'offline', message: 'No connection.', retryable: true }, retry)
        await caller.updateComplete
        expect(notified).toEqual([])
        const box = caller.shadowRoot!.querySelector('.inline-failure')!
        expect(box.getAttribute('role')).toBe('alert')
        // the island's server not answering is not the user being offline
        expect(box.textContent).toContain('could not be loaded')
        expect(box.textContent).not.toContain('No connection')
        ;(box.querySelector('button') as HTMLButtonElement).click()
        expect(retry).toHaveBeenCalledOnce()
        await caller.updateComplete
        expect(caller.shadowRoot!.querySelector('.inline-failure')).toBeNull()
    })

    it('the page\'s own caller keeps the toast', async () => {
        const { caller, child } = await mount(false)
        fail(child, { kind: 'server', message: 'The server could not complete the request.', retryable: true })
        await caller.updateComplete
        expect(notified).toHaveLength(1)
        expect(caller.shadowRoot!.querySelector('.inline-failure')).toBeNull()
    })
})
