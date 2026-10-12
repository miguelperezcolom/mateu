import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import { safeLocalStorage } from '@infra/safeStorage.ts'
import { authHeaders, sessionId } from '@infra/http/authToken.ts'
import { updateHeaderValue } from '@infra/ui/headerValues.ts'

/**
 * The APP EVENT STREAM of `@App(liveUpdates)`: header-value changes the server publishes to every
 * session (`LiveHeaderValues.publish`) arrive here as `UpdateHeaderValue` commands.
 *
 * ONE stream per BROWSER, not per tab. Browsers allow about six connections per host over HTTP/1.1;
 * a stream per tab would starve the app's own requests after a few tabs. So the tabs elect a leader
 * through localStorage (a heartbeat every few seconds; a leader silent for longer than
 * {@link STALE_MS} is replaced), only the leader holds the stream, and it hands each change to the
 * others through the header-values store's storage broadcast. No polling: the server pushes, and an
 * idle stream only carries a heartbeat.
 *
 * The stream is the existing SSE endpoint (`/mateu/v3/sse/…`) running the app-level
 * `_live-updates` action — no new endpoint in any adapter. The server ends it every few minutes on
 * purpose; the leader reconnects at once (with a back-off on errors).
 */
export const LEADER_KEY = 'mateu-live-leader'
export const HEARTBEAT_MS = 5_000
export const STALE_MS = 15_000

export interface LeaderRecord { tab: string, at: number }

/** Pure: should `tab` take (or keep) the lead, given the current record and the time? */
export const shouldLead = (record: LeaderRecord | null, tab: string, now: number): boolean =>
    !record || record.tab === tab || now - record.at > STALE_MS

/** Pure: the wait before reconnecting after `failures` consecutive errors (0 = a clean end). */
export const reconnectDelay = (failures: number): number =>
    failures <= 0 ? 1_000 : Math.min(60_000, 2_000 * 2 ** (failures - 1))

/** Pure: the header-value changes an increment carries. */
export const headerChangesOf = (increment: unknown): { id: string, value: string }[] => {
    const commands = (increment as { commands?: { type?: string, data?: { id?: string, value?: string } }[] })?.commands ?? []
    return commands
        .filter((c) => c?.type === 'UpdateHeaderValue' && c.data?.id)
        .map((c) => ({ id: c.data!.id!, value: c.data!.value ?? '' }))
}

const tabId = Math.random().toString(36).slice(2) + Date.now().toString(36)

interface Target { baseUrl: string, route: string, serverSideType: string }

let target: Target | null = null
let heartbeat: ReturnType<typeof setInterval> | undefined
let controller: AbortController | null = null
let failures = 0
let reconnectTimer: ReturnType<typeof setTimeout> | undefined

const readLeader = (): LeaderRecord | null => safeLocalStorage.getJson<LeaderRecord | null>(LEADER_KEY, null)

const tick = () => {
    if (!target) return
    const now = Date.now()
    if (shouldLead(readLeader(), tabId, now)) {
        safeLocalStorage.setJson(LEADER_KEY, { tab: tabId, at: now })
        // re-read: two tabs claiming in the same instant — the last writer wins, the other yields
        if (readLeader()?.tab === tabId) {
            if (!controller) connect()
            return
        }
    }
    stopStream()
}

const stopStream = () => {
    clearTimeout(reconnectTimer)
    reconnectTimer = undefined
    controller?.abort()
    controller = null
}

const connect = () => {
    if (!target || controller) return
    const own = new AbortController()
    controller = own
    const { baseUrl, route, serverSideType } = target
    const headers: Record<string, string> = { 'Accept': 'text/event-stream', 'Content-Type': 'application/json' }
    Object.assign(headers, authHeaders())
    const sid = sessionId(false)
    if (sid) headers['X-Session-Id'] = sid
    const path = (route || '_no_route').replace(/^\/+/, '')
    fetch(baseUrl + '/mateu/v3/sse/' + path, {
        method: 'POST',
        headers,
        signal: own.signal,
        body: JSON.stringify({
            serverSideType, appState: {}, componentState: {}, parameters: {},
            initiatorComponentId: 'mateu-live-updates', consumedRoute: '', route: '/' + path,
            actionId: '_live-updates',
        }),
    }).then(async (response) => {
        if (!response.ok || !response.body) throw new Error('live updates: ' + response.status)
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        let buffer = ''
        failures = 0
        while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += value
            const events = buffer.split('\n\n')
            buffer = events.pop() ?? ''
            for (const event of events) {
                const line = event.trim()
                if (!line.startsWith('data:')) continue
                try {
                    for (const change of headerChangesOf(JSON.parse(line.substring(5).trim()))) {
                        updateHeaderValue(change.id, change.value)
                    }
                } catch { /* a heartbeat or a malformed chunk: skip it */ }
            }
        }
    }).catch(() => {
        if (own.signal.aborted) return
        failures++
    }).finally(() => {
        if (controller !== own) return // stopped, or replaced
        controller = null
        if (!target) return
        reconnectTimer = setTimeout(() => { if (target && !controller) tick() }, reconnectDelay(failures))
    })
}

const release = () => {
    stopStream()
    if (readLeader()?.tab === tabId) safeLocalStorage.remove(LEADER_KEY)
}

let unloadHooked = false

/**
 * Starts (or stops) the stream for the shell on show: `app.liveUpdates` on → this tab competes for
 * the lead; off → it lets go. Called on every shell update; cheap when nothing changed.
 */
export const syncLiveUpdates = (app: App | undefined, baseUrl: string) => {
    const want = !!app?.liveUpdates && typeof window !== 'undefined' && typeof fetch === 'function'
    if (!want) {
        if (target) {
            target = null
            clearInterval(heartbeat)
            heartbeat = undefined
            release()
        }
        return
    }
    const next: Target = { baseUrl, route: app!.rootRoute || '', serverSideType: app!.serverSideType ?? '' }
    const changed = !target || target.baseUrl !== next.baseUrl || target.serverSideType !== next.serverSideType
    target = next
    if (changed) stopStream()
    if (!heartbeat) {
        heartbeat = setInterval(tick, HEARTBEAT_MS)
    }
    if (!unloadHooked) {
        unloadHooked = true
        window.addEventListener('pagehide', release)
    }
    tick()
}
