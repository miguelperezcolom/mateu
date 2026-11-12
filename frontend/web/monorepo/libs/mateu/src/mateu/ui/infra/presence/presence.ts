import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import { credentialHeadersFor } from '@infra/http/credentialScope.ts'
import { rendererHeaders } from '@infra/http/rendererIdentity.ts'
import { dirtyGuard } from '@infra/ui/dirtyGuard.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'

/**
 * RECORD PRESENCE (`@App(presence = true)`): who else has the record on screen open, and who is
 * EDITING it — "Ana is editing this record".
 *
 * - A record page (mateu-content-header at level 0 of a form/page, never a listing, never an
 *   island) WATCHES its record: route (mount-relative) + view class. This tab reports itself every
 *   {@link HEARTBEAT_MS} with the `_presence` app-level action — `viewing`, or `editing` while the
 *   page holds unsaved changes (dirtyGuard) — and once more at once when that flips; `leave` when
 *   the page goes away. The answer is a `PresenceChanged` command listing the OTHER people.
 * - Changes the others make arrive on the app event stream (liveUpdates.ts — one stream per
 *   browser, the leader tab relays them), so the chip follows within a second, not a heartbeat.
 * - The server forgets a tab not seen for 30 s: a closed tab disappears even when its `leave`
 *   never arrived. Anonymous callers take no part (the server answers nothing).
 *
 * Pure helpers first (tested), then the tiny singleton the chip and the stream share.
 */

export const PRESENCE_ACTION = '_presence'
export const HEARTBEAT_MS = 10_000

export interface PresenceEntry { name: string, editing: boolean, since?: string }
export interface PresenceChange { key: string, entries: PresenceEntry[] }

/** Pure: the presence changes an increment carries (a heartbeat's answer, a stream event). */
export const presenceChangesOf = (increment: unknown): PresenceChange[] => {
    const commands = (increment as { commands?: { type?: string, data?: PresenceChange }[] } | null)?.commands ?? []
    return commands
        .filter((c) => c?.type === 'PresenceChanged' && typeof c.data?.key === 'string')
        .map((c) => ({ key: c.data!.key, entries: Array.isArray(c.data!.entries) ? c.data!.entries : [] }))
}

/** Pure: the route a page reports — the path without the app's own mount, no surrounding slashes. */
export const presenceRouteOf = (pathname: string, rootRoute?: string): string => {
    let path = (pathname || '').split('?')[0].split('#')[0]
    const root = (rootRoute || '').replace(/\/+$/, '')
    if (root && root !== '/' && (path === root || path.startsWith(root + '/'))) path = path.substring(root.length)
    return path.replace(/\/{2,}/g, '/').replace(/^\/+|\/+$/g, '')
}

/**
 * Pure: whether a page on `route` is a RECORD page. A create page (`…/new`) is not one yet and the
 * root is none. A route of two or more segments (`orders/7`, `orders/7/edit`, `people/luke`) is one;
 * a one-segment route (`dashboard`, `profile`) only when the page EDITS (it asks to confirm leaving
 * with unsaved changes — an EditableView, a YAML record page) — so a dashboard shows nobody.
 */
export const isRecordRoute = (route: string, edits = false): boolean => {
    const path = route.replace(/\/(edit|view)$/, '')
    if (!path.length || path === 'new' || path.endsWith('/new')) return false
    return edits || path.split('/').filter(Boolean).length >= 2
}

/** Pure: "Ana", "Ana and Bob", "Ana, Bob and 2 more". */
export const namesText = (names: string[], lang?: string): string => {
    if (names.length <= 1) return names[0] ?? ''
    if (names.length === 2) return names[0] + chromeText('presenceAnd', lang) + names[1]
    return chromeTextf('presenceMore', { names: names.slice(0, 2).join(', '), n: names.length - 2 }, lang)
}

export interface PresenceSummary { text: string, tone: 'warning' | 'neutral', editors: string[], viewers: string[] }

/** Pure: what the chip says — editors first (a warning: they may overwrite each other), then viewers. */
export const presenceSummary = (entries: PresenceEntry[], lang?: string): PresenceSummary | null => {
    if (!entries.length) return null
    const editors = entries.filter((e) => e.editing).map((e) => e.name)
    const viewers = entries.filter((e) => !e.editing).map((e) => e.name)
    const parts: string[] = []
    if (editors.length) {
        parts.push(chromeTextf(editors.length === 1 ? 'presenceEditing' : 'presenceEditingMany', { names: namesText(editors, lang) }, lang))
    }
    if (viewers.length) {
        parts.push(chromeTextf(viewers.length === 1 ? 'presenceViewing' : 'presenceViewingMany', { names: namesText(viewers, lang) }, lang))
    }
    return { text: parts.join(' · '), tone: editors.length ? 'warning' : 'neutral', editors, viewers }
}

/** Pure: the people who START editing between two answers (announced once, politely). */
export const newEditors = (before: PresenceEntry[], after: PresenceEntry[]): string[] => {
    const were = new Set(before.filter((e) => e.editing).map((e) => e.name))
    return after.filter((e) => e.editing && !were.has(e.name)).map((e) => e.name)
}

/** Pure: initials for the avatar of a name ("Ana López" → "AL", "ana@x.org" → "A"). */
export const initialsOf = (name: string): string => {
    const words = (name || '?').split('@')[0].split(/[\s._-]+/).filter(Boolean)
    const letters = words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? '?')[0]
    return (letters ?? '?').toUpperCase()
}

// --- the singleton

interface Target { baseUrl: string, rootRoute: string, serverSideType: string }

interface Watch {
    route: string
    view: string
    key?: string
    entries: PresenceEntry[]
    editing: boolean
    listeners: Set<(entries: PresenceEntry[]) => void>
    timer?: ReturnType<typeof setInterval>
}

const tab = Math.random().toString(36).slice(2) + Date.now().toString(36)
let target: Target | null = null
const watches = new Map<string, Watch>()
let dirtyHooked = false

/** Whether the shell on screen asked for presence (the chip draws nothing otherwise). */
export const presenceEnabled = (): boolean => target !== null

/** The shell on show: `app.presence` on → record pages report themselves; off → they stop. */
export const syncPresence = (app: App | undefined, baseUrl: string): void => {
    const want = !!app?.presence && typeof window !== 'undefined' && typeof fetch === 'function'
    if (!want) {
        if (target) {
            for (const watch of watches.values()) stopWatch(watch, true)
            target = null
        }
        return
    }
    const next: Target = { baseUrl, rootRoute: app!.rootRoute || '', serverSideType: app!.serverSideType ?? '' }
    const changed = !target || target.baseUrl !== next.baseUrl || target.serverSideType !== next.serverSideType
    if (changed && target) for (const watch of watches.values()) stopWatch(watch, true)
    target = next
    if (changed) for (const watch of watches.values()) startWatch(watch)
    if (!dirtyHooked && typeof document !== 'undefined') {
        dirtyHooked = true
        // editing = the page holds unsaved changes: report the flip at once, not on the next beat
        const recheck = () => queueMicrotask(() => {
            const editing = dirtyGuard.dirty
            for (const watch of watches.values()) {
                if (watch.editing !== editing) {
                    watch.editing = editing
                    beat(watch)
                }
            }
        })
        document.addEventListener('dirty', recheck)
        document.addEventListener('clean', recheck)
        window.addEventListener('pagehide', () => { for (const watch of watches.values()) send(watch, 'leave') })
    }
}

/** The route of the page on screen, as this app reports it. */
export const currentPresenceRoute = (): string =>
    presenceRouteOf(typeof location !== 'undefined' ? location.pathname : '', target?.rootRoute)

/**
 * A record page watches its record while it is on screen; the returned function stops watching.
 * `onChange` hears the OTHER people (never this user), the first time after the first answer.
 */
export const watchRecord = (route: string, view: string, onChange: (entries: PresenceEntry[]) => void, edits = false): (() => void) => {
    if (!isRecordRoute(route, edits)) return () => undefined
    const id = route + '|' + view
    let watch = watches.get(id)
    if (!watch) {
        watch = { route, view, entries: [], editing: dirtyGuard.dirty, listeners: new Set() }
        watches.set(id, watch)
        startWatch(watch)
    }
    watch.listeners.add(onChange)
    if (watch.key) onChange(watch.entries)
    const owned = watch
    return () => {
        owned.listeners.delete(onChange)
        if (owned.listeners.size > 0) return
        watches.delete(id)
        stopWatch(owned, true)
    }
}

/** A presence change from the event stream (or another tab): the watch of that record follows. */
export const applyPresenceChange = (change: PresenceChange): void => {
    for (const watch of watches.values()) {
        if (watch.key === change.key) update(watch, change.entries)
    }
}

const startWatch = (watch: Watch) => {
    if (!target) return
    beat(watch)
    clearInterval(watch.timer)
    watch.timer = setInterval(() => beat(watch), HEARTBEAT_MS)
}

const stopWatch = (watch: Watch, leave: boolean) => {
    clearInterval(watch.timer)
    watch.timer = undefined
    if (leave) send(watch, 'leave')
}

const beat = (watch: Watch) => send(watch, watch.editing ? 'editing' : 'viewing')

const update = (watch: Watch, entries: PresenceEntry[]) => {
    watch.entries = entries
    for (const listener of watch.listeners) listener(entries)
}

const send = (watch: Watch, state: 'viewing' | 'editing' | 'leave') => {
    if (!target) return
    const { baseUrl, rootRoute, serverSideType } = target
    const path = (rootRoute || '_no_route').replace(/^\/+/, '') || '_no_route'
    const url = baseUrl + '/mateu/v3/sync/' + path
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    Object.assign(headers, credentialHeadersFor(url), rendererHeaders())
    fetch(url, {
        method: 'POST',
        headers,
        // a leave sent while the page unloads must still go out
        keepalive: state === 'leave',
        body: JSON.stringify({
            serverSideType, appState: {}, componentState: {},
            parameters: { route: watch.route, view: watch.view, tab, state },
            initiatorComponentId: 'mateu-presence', consumedRoute: '', route: '/' + path,
            actionId: PRESENCE_ACTION,
        }),
    }).then(async (response) => {
        if (!response.ok || state === 'leave') return
        for (const change of presenceChangesOf(await response.json())) {
            watch.key = change.key
            update(watch, change.entries)
        }
    }).catch(() => { /* presence is best effort: the next heartbeat tries again */ })
}

/** Test hook: forget every watch and the shell. */
export const resetPresence = (): void => {
    for (const watch of watches.values()) clearInterval(watch.timer)
    watches.clear()
    target = null
}
