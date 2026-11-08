import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import { inboxStore, type InboxEntry, type InboxState } from '@infra/notify/inboxStore.ts'
import { isFinished, taskStore, type TaskEntry, type TaskState } from '@infra/progress/taskStore.ts'
import { navigateToRoute } from '@infra/ui/rowRoute.ts'
import { dirtyGuard } from '@infra/ui/dirtyGuard.ts'

/**
 * OS-level notifications on the web (design/progress-and-notifications.md "OS-level
 * notifications") — the Web Notifications API, for an app that opts in (`@App(osNotifications)`).
 *
 * - Permission is asked ONLY from a user gesture: the "Notify me on this device" control the bell
 *   and the task center show while the permission is still `default` ({@link canOfferOsNotifications});
 *   never on load (browsers penalise that, and users rightly refuse it).
 * - Two events leave the page: a NEW unread inbox entry of the session (an `inbox` message, or an
 *   entry pushed live) and a task that finished (done/failed) while in the background (not
 *   blocking, or moved there). Only while the tab is hidden — in front, the toast and the task
 *   center already say it.
 * - `tag` = entry id / task id: several tabs of the app collapse into one notification. A click
 *   focuses the tab and opens the entry's route through the app's own navigation.
 *
 * No lit here: the shell's eager path imports it (appExtrasMount.ts).
 */

type NotificationCtor = {
    new (title: string, options?: { body?: string, tag?: string }): { onclick: ((e: Event) => void) | null, close?: () => void }
    permission: 'default' | 'granted' | 'denied'
    requestPermission: () => Promise<'default' | 'granted' | 'denied'>
}

const api = (): NotificationCtor | undefined => {
    try {
        return (globalThis as { Notification?: NotificationCtor }).Notification
    } catch {
        return undefined
    }
}

let enabled = false
let host: HTMLElement | null = null
let installed = false
const changeListeners = new Set<() => void>()

const changed = () => changeListeners.forEach((l) => { try { l() } catch { /* keep going */ } })

/** The app shell says whether it opted in (called from the shell's updated(), appExtrasMount.ts). */
export const syncOsNotifications = (app: App | undefined, from: HTMLElement | null): void => {
    host = from
    const next = !!app?.osNotifications
    if (next !== enabled) {
        enabled = next
        changed()
    }
    if (enabled && !installed) {
        installed = true
        installWatchers()
    }
}

/** Whether to offer "Notify me on this device": opted in, supported, and not decided yet. */
export const canOfferOsNotifications = (): boolean => {
    const N = api()
    return enabled && !!N && N.permission === 'default'
}

/** Asks for the permission — call it ONLY from a click. */
export const requestOsNotifications = async (): Promise<string> => {
    const N = api()
    if (!N) return 'denied'
    let answer: string
    try {
        answer = await N.requestPermission()
    } catch {
        answer = N.permission
    }
    changed()
    return answer
}

/** The bell and the task center re-render when the offer changes. */
export const onOsNotificationsChange = (listener: () => void): (() => void) => {
    changeListeners.add(listener)
    return () => changeListeners.delete(listener)
}

const hidden = (): boolean => typeof document !== 'undefined' && document.visibilityState === 'hidden'

/** Shows one OS notification when allowed and the page is not in front. True when shown. */
export const showOsNotification = (title: string, body: string | null | undefined, tag: string,
                                   route?: string | null): boolean => {
    const N = api()
    if (!enabled || !N || N.permission !== 'granted' || !hidden()) return false
    try {
        const n = new N(title || '', { body: body ?? '', tag })
        n.onclick = () => {
            try { window.focus() } catch { /* not ours to focus */ }
            n.close?.()
            const from = host?.isConnected ? host : null
            if (route && from && dirtyGuard.confirmLeave()) navigateToRoute(from, route)
        }
        return true
    } catch {
        // some browsers only allow notifications from a service worker
        return false
    }
}

const routeOfEntry = (entry: InboxEntry): string | null =>
    entry.route ?? entry.actions?.find((a) => a.route)?.route ?? null

// ── what is worth leaving the page for ───────────────────────────────────────

let seenEntries: Set<string> | null = null
const taskStates = new Map<string, string>()

/** Pure: the session's new unread entries (pushed / inbox messages) since `seen`. */
export const newSessionEntries = (state: InboxState, seen: Set<string>): InboxEntry[] =>
    (state.session ?? []).filter((e) => e.local && e.unread && !seen.has(e.id))

/** Pure: whether an entry is a background task that just finished (it was running before). */
export const finishedInBackground = (entry: TaskEntry, before: string | undefined): boolean =>
    before === 'running' && isFinished(entry.progress)
    && (entry.progress.state === 'done' || entry.progress.state === 'failed')
    && (!entry.progress.blocking || entry.movedToBackground)

const onInbox = (state: InboxState) => {
    if (!seenEntries) {
        seenEntries = new Set((state.session ?? []).map((e) => e.id))
        return
    }
    for (const entry of newSessionEntries(state, seenEntries)) {
        seenEntries.add(entry.id)
        showOsNotification(entry.title, entry.text, entry.id, routeOfEntry(entry))
    }
}

const onTasks = (state: TaskState) => {
    for (const entry of state.entries) {
        const id = entry.progress.taskId
        const before = taskStates.get(id)
        const now = entry.progress.state ?? 'running'
        if (before === now) continue
        taskStates.set(id, now)
        if (finishedInBackground(entry, before)) {
            const p = entry.progress
            showOsNotification(p.title ?? '', p.state === 'failed' ? (p.error ?? p.text) : p.text, id,
                p.resultActions?.find((a) => a.route)?.route ?? null)
        }
    }
}

const installWatchers = () => {
    onInbox(inboxStore.state)
    inboxStore.subscribe(onInbox)
    onTasks(taskStore.state)
    taskStore.subscribe(onTasks)
}

/** test hook */
export const resetOsNotifications = (): void => {
    enabled = false
    host = null
    installed = false
    seenEntries = null
    taskStates.clear()
    changeListeners.clear()
}
