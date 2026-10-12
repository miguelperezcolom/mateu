// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuApiClient: { runAction: (...a: unknown[]) => runAction(...a) } }))
const sseRun = vi.fn()
// a failure is injected as a plain function, outside vi.fn's result tracking
let sseFailure: Error | undefined
vi.mock('@application/SSEService.ts', () => ({ sseService: { runAction: (...a: unknown[]) => {
    sseRun(...a)
    return sseFailure ? Promise.reject(sseFailure) : Promise.resolve()
} } }))

import './mateu-notification-bell'
import type { MateuNotificationBell } from './mateu-notification-bell'
import { dirtyGuard } from './dirtyGuard'
import { dispatchAppHeaderAction } from './renderers/appHeaderActions'

/**
 * The notification inbox (`NotificationsSupplier` on the app class). The bell asks the APP for its
 * inbox (`_notifications-list`), shows the unread count — also to a screen reader —, marks an entry
 * read on click (`_notifications-read`) and navigates to its route like a menu click.
 */
describe('mateu-notification-bell', () => {
    const LIST = [
        { id: 'n1', title: 'Check-in pending', route: 'checkin/7', unread: true, when: '10:00' },
        { id: 'n2', title: 'Report ready', unread: true },
        { id: 'n3', title: 'Old news', unread: false },
    ]
    let events: { type: string, detail: unknown }[]
    let listening: AbortController

    const answer = (list: unknown[]) => runAction.mockResolvedValue({ fragments: [{ data: { _notifications: list } }] })
    const mount = async () => {
        const bell = document.createElement('mateu-notification-bell') as MateuNotificationBell
        bell.app = { serverSideType: 'my.App', rootRoute: 'home' } as never
        bell.baseUrl = '/base'
        for (const type of ['route-changed', 'navigate-to-requested']) {
            document.body.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }), { signal: listening.signal })
        }
        document.body.appendChild(bell)
        await bell.updateComplete
        await new Promise(r => setTimeout(r, 0))
        await bell.updateComplete
        return bell
    }
    const $ = (b: MateuNotificationBell, sel: string) => b.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (b: MateuNotificationBell, sel: string) => Array.from(b.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const flush = async (b: MateuNotificationBell) => { await new Promise(r => setTimeout(r, 0)); await b.updateComplete }

    beforeEach(() => { events = []; listening = new AbortController(); runAction.mockReset() })
    afterEach(() => { listening.abort(); document.body.innerHTML = ''; document.documentElement.lang = ''; vi.restoreAllMocks() })

    it('fetches the inbox from the APP once it knows the app, and badges the unread count', async () => {
        answer(LIST)
        const bell = await mount()
        expect(runAction).toHaveBeenCalledTimes(1)
        const args = runAction.mock.calls[0]
        expect(args.slice(0, 4)).toEqual(['/base', 'home', '', '_notifications-list'])
        expect(args[6]).toBe('my.App')
        expect($(bell, '.badge').textContent).toBe('2')
    })

    it('the unread count is part of the button NAME, so a screen reader hears it too', async () => {
        answer(LIST)
        const bell = await mount()
        const button = $(bell, '.bell-button')
        expect(button.getAttribute('aria-label')).toBe('Notifications, 2 unread')
        expect(button.getAttribute('aria-expanded')).toBe('false')
    })

    it('nothing unread: no badge and a plain name', async () => {
        answer([LIST[2]])
        const bell = await mount()
        expect($(bell, '.badge')).toBeNull()
        expect($(bell, '.bell-button').getAttribute('aria-label')).toBe('Notifications')
    })

    it('more than 99 shows 99+', async () => {
        answer(Array.from({ length: 120 }, (_, i) => ({ id: 'x' + i, title: 't', unread: true })))
        const bell = await mount()
        expect($(bell, '.badge').textContent).toBe('99+')
    })

    it('opening refetches; an entry click marks it read and navigates like a menu click', async () => {
        answer(LIST)
        const bell = await mount()
        $(bell, '.bell-button').click()
        await flush(bell)
        expect(runAction).toHaveBeenCalledTimes(2)
        expect($(bell, '.bell-button').getAttribute('aria-expanded')).toBe('true')
        const entries = $$(bell, '.entry')
        expect(entries).toHaveLength(3)
        expect(entries[0].getAttribute('role')).toBe('button')
        expect(entries[0].getAttribute('tabindex')).toBe('0')
        entries[0].click()
        await flush(bell)
        const read = runAction.mock.calls[2]
        expect(read[3]).toBe('_notifications-read')
        expect(read[8]).toEqual({ ids: ['n1'] })
        expect(events).toEqual([
            { type: 'route-changed', detail: { route: 'checkin/7' } },
            { type: 'navigate-to-requested', detail: { route: 'checkin/7' } },
        ])
        expect($(bell, '.panel')).toBeNull()
    })

    it('an entry is activated with the keyboard too', async () => {
        answer(LIST)
        const bell = await mount()
        $(bell, '.bell-button').click()
        await flush(bell)
        $$(bell, '.entry')[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await flush(bell)
        expect(events.map(e => e.type)).toContain('navigate-to-requested')
    })

    it('unsaved changes the user does not want to lose cancel the navigation', async () => {
        answer(LIST)
        vi.spyOn(dirtyGuard, 'confirmLeave').mockReturnValue(false)
        const bell = await mount()
        $(bell, '.bell-button').click()
        await flush(bell)
        $$(bell, '.entry')[0].click()
        await flush(bell)
        expect(events).toEqual([])
        expect($(bell, '.panel')).not.toBeNull()
    })

    it('an already-read entry without route neither calls the server nor navigates', async () => {
        answer(LIST)
        const bell = await mount()
        $(bell, '.bell-button').click()
        await flush(bell)
        const calls = runAction.mock.calls.length
        $$(bell, '.entry')[2].click()
        await flush(bell)
        expect(runAction.mock.calls.length).toBe(calls)
        expect(events).toEqual([])
    })

    it('"Mark all read" sends ids: "all"; it is disabled when nothing is unread', async () => {
        answer(LIST)
        const bell = await mount()
        $(bell, '.bell-button').click()
        await flush(bell)
        $(bell, '.mark-all').click()
        await flush(bell)
        expect(runAction.mock.calls.at(-1)![8]).toEqual({ ids: 'all' })

        document.body.innerHTML = ''
        answer([LIST[2]])
        const quiet = await mount()
        $(quiet, '.bell-button').click()
        await flush(quiet)
        expect(($(quiet, '.mark-all') as HTMLButtonElement).disabled).toBe(true)
    })

    it('an empty inbox says so; an unavailable one keeps the last list', async () => {
        answer([])
        const bell = await mount()
        $(bell, '.bell-button').click()
        await flush(bell)
        expect($(bell, '.empty').textContent).toBeTruthy()

        document.body.innerHTML = ''
        answer(LIST)
        const b2 = await mount()
        runAction.mockRejectedValue(new Error('down'))
        $(b2, '.bell-button').click()
        await flush(b2)
        expect($$(b2, '.entry')).toHaveLength(3)
    })

    it('a click outside closes the panel', async () => {
        answer(LIST)
        const bell = await mount()
        $(bell, '.bell-button').click()
        await flush(bell)
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }))
        await bell.updateComplete
        expect($(bell, '.panel')).toBeNull()
    })
})

/** App-header actions (AppActionsSupplier): always dispatched against the APP, initiated by the
 *  on-screen component (found across shadow roots) so streamed fragments land on a real component. */
describe('dispatchAppHeaderAction', () => {
    beforeEach(() => { sseRun.mockReset(); sseFailure = undefined })
    afterEach(() => { document.body.innerHTML = '' })

    it('runs the action on the app class over SSE, with the on-screen mateu-component as initiator', async () => {
        const shell = document.createElement('div') as HTMLDivElement & { baseUrl?: string }
        shell.baseUrl = '/b'
        document.body.appendChild(shell)
        const host = document.createElement('div')
        shell.appendChild(host)
        const comp = document.createElement('mateu-component')
        comp.id = 'screen-1'
        host.attachShadow({ mode: 'open' }).appendChild(comp)

        await dispatchAppHeaderAction({ serverSideType: 'my.App', rootRoute: 'r' } as never, shell, 'deploy')
        const args = sseRun.mock.calls[0]
        expect(args[1]).toBe('/b')
        expect(args[2]).toBe('r')
        expect(args[4]).toBe('deploy')
        expect(args[5]).toBe('screen-1')
        expect(args[7]).toBe('my.App')
        expect(args[10]).toBe(comp)
    })

    it('with no component on screen the shell itself initiates; no root route → _no_route', async () => {
        const shell = document.createElement('div')
        document.body.appendChild(shell)
        await dispatchAppHeaderAction({ serverSideType: 'my.App' } as never, shell, 'x')
        const args = sseRun.mock.calls[0]
        expect(args[1]).toBe('')
        expect(args[2]).toBe('_no_route')
        expect(args[5]).toBe('app-header-action')
        expect(args[10]).toBe(shell)
    })

    it('a failure is thrown to the shell, which shows it in its own idiom', async () => {
        sseFailure = new Error('boom')
        const shell = document.createElement('div')
        let caught: unknown
        try { await dispatchAppHeaderAction({ serverSideType: 'a' } as never, shell, 'x') } catch (e) { caught = e }
        expect((caught as Error)?.message).toBe('boom')
    })
})
