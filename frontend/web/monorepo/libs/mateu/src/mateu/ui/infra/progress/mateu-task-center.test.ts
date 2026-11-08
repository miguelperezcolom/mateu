// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuApiClient: { runAction: (...a: unknown[]) => runAction(...a) } }))
const announce = vi.fn()
vi.mock('@infra/a11y/announcer.ts', () => ({ announce: (...a: unknown[]) => announce(...a) }))

import './mateu-task-center'
import type { MateuTaskCenter } from './mateu-task-center'
import { taskStore } from './taskStore'
import type { Progress } from '@mateu/shared/apiClients/dtos/Progress.ts'

/**
 * The task center: a blocking task as a modal progress (progressbar semantics, Cancel, Background),
 * background tasks behind an indicator with the running count, finished tasks with their outcome,
 * result actions and Retry; start and end announced politely.
 */
describe('mateu-task-center', () => {
    const p = (taskId: string, over: Partial<Progress> = {}): Progress =>
        ({ taskId, title: 'Import ' + taskId, text: 'Working', state: 'running', blocking: false, ...over })
    let center: MateuTaskCenter
    const $ = (sel: string) => center.shadowRoot!.querySelector(sel) as HTMLElement | null
    const $$ = (sel: string) => Array.from(center.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const settle = async () => { await new Promise(r => setTimeout(r, 0)); await center.updateComplete }
    const buttons = () => $$('button').map((b) => b.textContent?.trim())

    beforeEach(async () => {
        taskStore.reset()
        runAction.mockReset()
        announce.mockReset()
        center = document.createElement('mateu-task-center') as MateuTaskCenter
        document.body.appendChild(center)
        await center.updateComplete
    })
    afterEach(() => { document.body.innerHTML = '' })

    it('a blocking task is a modal progress with progressbar semantics, Cancel and Background', async () => {
        taskStore.upsert(p('a', { blocking: true, cancellable: true, backgroundable: true, fraction: 0.4, done: 12, total: 30 }))
        await settle()
        const modal = $('.modal')!
        expect(modal.getAttribute('role')).toBe('dialog')
        expect(modal.getAttribute('aria-modal')).toBe('true')
        const bar = $('.modal [role="progressbar"]')!
        expect(bar.getAttribute('aria-valuenow')).toBe('40')
        expect(bar.getAttribute('aria-valuetext')).toContain('12 of 30')
        expect(modal.textContent).toContain('12 of 30')
        expect(buttons()).toEqual(['Background', 'Cancel'])
        expect(announce).toHaveBeenCalledWith('Import a started', { politeness: 'polite' })
    })

    it('without a fraction the bar is indeterminate (no aria-valuenow)', async () => {
        taskStore.upsert(p('a', { blocking: true }))
        await settle()
        expect($('.modal [role="progressbar"]')!.hasAttribute('aria-valuenow')).toBe(false)
    })

    it('Background moves the task to the list behind the indicator, which counts it', async () => {
        taskStore.upsert(p('a', { blocking: true, backgroundable: true }))
        await settle()
        ;($$('button').find((b) => b.textContent?.trim() === 'Background'))!.click()
        await settle()
        expect($('.modal')).toBeNull()
        const indicator = $('.indicator')!
        expect(indicator.textContent).toContain('1 running')
        expect(indicator.getAttribute('aria-label')).toBe('Show tasks, 1 running')
        indicator.click()
        await settle()
        expect($('.list')!.textContent).toContain('Import a')
    })

    it('Cancel asks the server with _progress-cancel through the task\'s own rail', async () => {
        runAction.mockResolvedValue({ commands: [{ type: 'Progress', data: p('a', { state: 'cancelled' }) }] })
        taskStore.upsert(p('a', { blocking: true, cancellable: true }), { baseUrl: '/b', route: '/import', serverSideType: 'my.Type' })
        await settle()
        ;($$('button').find((b) => b.textContent?.trim() === 'Cancel'))!.click()
        await settle()
        const args = runAction.mock.calls[0]
        expect(args.slice(0, 4)).toEqual(['/b', '/import', '', '_progress-cancel'])
        expect(args[6]).toBe('my.Type')
        expect(args[8]).toEqual({ taskId: 'a' })
        expect(taskStore.find('a')?.progress.state).toBe('cancelled')
        expect(announce).toHaveBeenLastCalledWith('Import a: cancelled', { politeness: 'polite' })
    })

    it('a failed retryable task offers Retry (re-running its action) and shows the error', async () => {
        const retry = vi.fn()
        taskStore.upsert(p('a'), { retry })
        taskStore.upsert(p('a', { state: 'failed', retryable: true, error: 'Disk full' }))
        await settle()
        $('.indicator')!.click()
        await settle()
        expect($('.task-error')!.textContent).toBe('Disk full')
        ;($$('button').find((b) => b.textContent?.trim() === 'Retry'))!.click()
        expect(retry).toHaveBeenCalledTimes(1)
        expect(taskStore.find('a')).toBeUndefined()
    })

    it('a finished task shows its result actions; a route action navigates', async () => {
        const initiator = document.createElement('div')
        document.body.appendChild(initiator)
        const routes: string[] = []
        initiator.addEventListener('navigate-to-requested', (e) => routes.push((e as CustomEvent).detail.route))
        taskStore.upsert(p('a', { blocking: true }), { initiator })
        taskStore.upsert(p('a', { blocking: true, state: 'done', text: '1,204 rows', resultActions: [{ label: 'Open report', route: '/reports/1' }] }))
        await settle()
        expect($('.modal')!.textContent).toContain('1,204 rows')
        expect(buttons()).toEqual(['Open report', 'Close'])
        $$('button')[0].click()
        expect(routes).toEqual(['/reports/1'])
    })

    it('several tasks at once: one modal at most, the rest in the list', async () => {
        taskStore.upsert(p('a'))
        taskStore.upsert(p('b'))
        taskStore.upsert(p('c', { blocking: true }))
        await settle()
        expect($$('.modal')).toHaveLength(1)
        expect($('.indicator')!.textContent).toContain('3 running')
        $('.indicator')!.click()
        await settle()
        expect($$('.list .task')).toHaveLength(2)
    })

    it('shows the server\'s ETA while the task runs, never once it ended', async () => {
        taskStore.upsert(p('a', { blocking: true, fraction: 0.5, etaSeconds: 125 }))
        await settle()
        expect($('.modal .eta')?.textContent).toBe('about 2 min left')
        taskStore.upsert(p('a', { blocking: true, fraction: 0.6, etaSeconds: null }))
        await settle()
        expect($('.modal .eta')).toBeNull()
        taskStore.upsert(p('a', { blocking: true, state: 'done', etaSeconds: 10 }))
        await settle()
        expect($('.modal .eta')).toBeNull()
    })

    it('offers OS notifications in the task list only to an app that opted in, while undecided', async () => {
        const { syncOsNotifications, resetOsNotifications } = await import('@infra/notify/osNotifications.ts')
        const requestPermission = vi.fn(async () => 'granted')
        ;(globalThis as unknown as { Notification: unknown }).Notification = { permission: 'default', requestPermission }
        try {
            taskStore.upsert(p('a'))
            await settle()
            $('.indicator')!.click()
            await settle()
            expect($('.os-notify')).toBeNull()
            syncOsNotifications({ osNotifications: true } as never, document.body)
            await settle()
            $('.os-notify')!.click()
            expect(requestPermission).toHaveBeenCalledTimes(1)
        } finally {
            resetOsNotifications()
            delete (globalThis as unknown as { Notification?: unknown }).Notification
        }
    })
})
