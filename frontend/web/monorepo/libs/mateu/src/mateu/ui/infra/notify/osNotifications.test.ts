// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import type { Progress } from '@mateu/shared/apiClients/dtos/Progress.ts'
import {
    canOfferOsNotifications, finishedInBackground, onOsNotificationsChange, requestOsNotifications,
    resetOsNotifications, showOsNotification, syncOsNotifications,
} from './osNotifications'
import { inboxStore } from './inboxStore'
import { taskStore, type TaskEntry } from '@infra/progress/taskStore.ts'

/**
 * OS-level notifications on the web: opt-in per app, permission asked only from the control,
 * shown only while the tab is hidden, for new session inbox entries and background tasks that end.
 */
class FakeNotification {
    static permission: 'default' | 'granted' | 'denied' = 'default'
    static requestPermission = vi.fn(async () => { FakeNotification.permission = 'granted'; return 'granted' as const })
    static shown: FakeNotification[] = []
    onclick: ((e: Event) => void) | null = null
    close = vi.fn()
    constructor(public title: string, public options?: { body?: string, tag?: string }) {
        FakeNotification.shown.push(this)
    }
}

let visibility: DocumentVisibilityState = 'hidden'
const app = (over: Partial<App> = {}) => ({ osNotifications: true, ...over }) as App
const progress = (taskId: string, over: Partial<Progress> = {}): Progress =>
    ({ taskId, title: 'Import', text: 'working', state: 'running', blocking: false, ...over })

beforeEach(() => {
    resetOsNotifications()
    inboxStore.reset()
    taskStore.reset()
    FakeNotification.permission = 'default'
    FakeNotification.shown = []
    FakeNotification.requestPermission.mockClear()
    ;(globalThis as unknown as { Notification: unknown }).Notification = FakeNotification
    visibility = 'hidden'
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility })
})

afterEach(() => {
    delete (globalThis as unknown as { Notification?: unknown }).Notification
})

describe('the offer', () => {
    it('is made only to an app that opted in, while the permission is undecided', async () => {
        expect(canOfferOsNotifications()).toBe(false)
        syncOsNotifications(app({ osNotifications: false }), document.body)
        expect(canOfferOsNotifications()).toBe(false)
        const changed = vi.fn()
        onOsNotificationsChange(changed)
        syncOsNotifications(app(), document.body)
        expect(changed).toHaveBeenCalled()
        expect(canOfferOsNotifications()).toBe(true)
        // nothing asked on load: only the control asks
        expect(FakeNotification.requestPermission).not.toHaveBeenCalled()
        expect(await requestOsNotifications()).toBe('granted')
        expect(canOfferOsNotifications()).toBe(false)
    })

    it('is not made where the API does not exist', async () => {
        delete (globalThis as unknown as { Notification?: unknown }).Notification
        syncOsNotifications(app(), document.body)
        expect(canOfferOsNotifications()).toBe(false)
        expect(await requestOsNotifications()).toBe('denied')
        expect(showOsNotification('t', 'b', 'x')).toBe(false)
    })
})

describe('what is shown', () => {
    beforeEach(() => {
        FakeNotification.permission = 'granted'
        syncOsNotifications(app(), document.body)
    })

    it('a new session inbox entry while the tab is hidden, tagged by its id', () => {
        inboxStore.applyChange({ notification: { id: 'n1', title: 'Approved', text: 'Your expense', unread: true } })
        expect(FakeNotification.shown.map((n) => [n.title, n.options?.body, n.options?.tag]))
            .toEqual([['Approved', 'Your expense', 'n1']])
        // the same entry again (the stored copy of an inbox message, pushed back): once
        inboxStore.applyChange({ notification: { id: 'n1', title: 'Approved', unread: true } })
        expect(FakeNotification.shown).toHaveLength(1)
    })

    it('nothing while the tab is in front, nothing for an app that did not opt in', () => {
        visibility = 'visible'
        inboxStore.applyChange({ notification: { id: 'n1', title: 'A', unread: true } })
        syncOsNotifications(app({ osNotifications: false }), document.body)
        visibility = 'hidden'
        inboxStore.applyChange({ notification: { id: 'n2', title: 'B', unread: true } })
        expect(FakeNotification.shown).toHaveLength(0)
    })

    it('nothing without permission', () => {
        FakeNotification.permission = 'denied'
        inboxStore.applyChange({ notification: { id: 'n1', title: 'A', unread: true } })
        expect(FakeNotification.shown).toHaveLength(0)
    })

    it('a background task that finishes; not a blocking one the user watched', () => {
        taskStore.upsert(progress('bg'))
        taskStore.upsert(progress('modal', { blocking: true }))
        taskStore.upsert(progress('bg', { state: 'done', text: 'Imported 300 rows' }))
        taskStore.upsert(progress('modal', { state: 'done', blocking: true }))
        expect(FakeNotification.shown.map((n) => [n.title, n.options?.body, n.options?.tag]))
            .toEqual([['Import', 'Imported 300 rows', 'bg']])
    })

    it('a failed one says what went wrong; a cancelled one says nothing', () => {
        taskStore.upsert(progress('f'))
        taskStore.upsert(progress('c'))
        taskStore.upsert(progress('f', { state: 'failed', error: 'Disk full' }))
        taskStore.upsert(progress('c', { state: 'cancelled' }))
        expect(FakeNotification.shown.map((n) => n.options?.body)).toEqual(['Disk full'])
    })

    it('a click focuses the tab and opens the route', () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        syncOsNotifications(app(), host)
        const routes: string[] = []
        host.addEventListener('navigate-to-requested', (e) => routes.push((e as CustomEvent).detail?.route))
        const focus = vi.spyOn(window, 'focus').mockImplementation(() => undefined)
        showOsNotification('Report ready', null, 'r1', '/reports/1')
        FakeNotification.shown[0].onclick!(new Event('click'))
        expect(focus).toHaveBeenCalled()
        expect(FakeNotification.shown[0].close).toHaveBeenCalled()
        expect(routes).toContain('/reports/1')
    })
})

describe('finishedInBackground', () => {
    const entry = (over: Partial<Progress>, moved = false): TaskEntry =>
        ({ progress: progress('x', over), movedToBackground: moved, dismissed: false, seenAt: 0, updatedAt: 0 })
    it('only a running → done/failed transition of a background task', () => {
        expect(finishedInBackground(entry({ state: 'done' }), 'running')).toBe(true)
        expect(finishedInBackground(entry({ state: 'done' }), undefined)).toBe(false)
        expect(finishedInBackground(entry({ state: 'done', blocking: true }), 'running')).toBe(false)
        expect(finishedInBackground(entry({ state: 'done', blocking: true }, true), 'running')).toBe(true)
        expect(finishedInBackground(entry({ state: 'cancelled' }), 'running')).toBe(false)
    })
})
