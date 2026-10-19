import { nanoid } from 'nanoid'
import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import { safeSessionStorage } from '@infra/safeStorage.ts'
import { sessionId } from '@infra/http/authToken.ts'
import { credentialHeadersFor } from '@infra/http/credentialScope.ts'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { SseParser } from './chatStream'
import { CLOSE_REQUESTED } from './chatEvents'
import { applyAgentEvent } from './agentEvents'

/**
 * The LIVE UI PUSH channel (`AppDto.agentPush`, conformance/mcp/README.md "Live UI push"): an agent
 * connected through MCP sends UI to THIS tab — a screen to render, a route to open, an event.
 *
 * ONE stream per TAB (not per browser, unlike liveUpdates.ts): a push is addressed to one UI
 * session, and the UI session is the tab — its id is the per-tab X-Session-Id ({@link sessionId}),
 * which the chat sends as its `sessionId` too. The channel proves it owns that session with a
 * random SECRET kept next to it in sessionStorage and sent only on the three agent actions.
 *
 * The stream is the existing SSE endpoint (`/mateu/v3/sse/…`) running the app-level
 * `_agent-channel` action: a first increment with the session's status, then one increment per
 * message (an `AgentPush` command), heartbeats, and the end after a few minutes — on which the tab
 * reconnects at once (with a back-off when it failed, or ended right away).
 *
 * `status` messages feed the "Connect AI" control (mateu-agent-connect) through
 * {@link subscribeAgentStatus}; every other one goes through {@link applyAgentEvent}, exactly as
 * the chat's events do.
 */

export const AGENT_SECRET_KEY = 'mateu-agent-channel-secret'
export const AGENT_PUSH_COMMAND = 'AgentPush'
export const AGENT_STATUS_EVENT = 'mateu-agent-status'
/** A stream that ended cleanly after living at least this long is a normal end: reconnect at once. */
export const HEALTHY_STREAM_MS = 5_000

export type AgentPushKind = 'status' | 'render' | 'navigate' | 'event'

export interface AgentPush { kind: AgentPushKind, event: string, detail: unknown }

export interface AgentStatus {
    /** The channel's stream is open. */
    connected: boolean
    /** At least one agent is paired with this session. */
    paired: boolean
    /** The paired agents' labels, in pairing order. */
    agents: string[]
}

export interface AgentPairing { code: string, expiresInSeconds: number }

const KINDS: AgentPushKind[] = ['status', 'render', 'navigate', 'event']

/** Pure: the AgentPush messages an increment carries, in order. */
export const agentPushesOf = (increment: unknown): AgentPush[] => {
    const commands = (increment as { commands?: { type?: string, data?: Partial<AgentPush> }[] } | null)?.commands ?? []
    if (!Array.isArray(commands)) return []
    return commands
        .filter((c) => c?.type === AGENT_PUSH_COMMAND && KINDS.includes(c.data?.kind as AgentPushKind)
            && typeof c.data?.event === 'string' && !!c.data.event)
        .map((c) => ({ kind: c.data!.kind as AgentPushKind, event: c.data!.event!, detail: c.data!.detail ?? {} }))
}

/** Pure: an SSE `data:` payload read as an increment, or null (a heartbeat, a malformed chunk). */
export const incrementOf = (payload: string): unknown => {
    if (!payload.trim()) return null
    try {
        return JSON.parse(payload)
    } catch {
        return null
    }
}

/** Pure: a status detail, read defensively. */
export const statusOf = (detail: unknown): Pick<AgentStatus, 'paired' | 'agents'> => {
    const d = (detail ?? {}) as { paired?: unknown, agents?: unknown }
    const agents = Array.isArray(d.agents) ? d.agents.filter((a): a is string => typeof a === 'string') : []
    return { paired: d.paired === true, agents }
}

/** Pure: the pairing a `_agent-pair` answer carries (`Data{_agentPairing: {code, expiresInSeconds}}`). */
export const pairingOf = (increment: unknown): AgentPairing | null => {
    const fragments = (increment as { fragments?: { data?: Record<string, unknown> }[] } | null)?.fragments ?? []
    for (const fragment of fragments) {
        const pairing = fragment?.data?._agentPairing as { code?: unknown, expiresInSeconds?: unknown } | null | undefined
        if (pairing && typeof pairing.code === 'string' && pairing.code) {
            const seconds = Number(pairing.expiresInSeconds)
            return { code: pairing.code, expiresInSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : 300 }
        }
    }
    return null
}

/**
 * Pure: the wait before the next connection and the failure count to carry, after a stream ended.
 * A clean end of a stream that lived long enough is the server's periodic end: at once, no
 * failures. An error — or a "clean" end right after opening (a refused channel answers and ends) —
 * backs off exponentially, 2 s doubling up to a minute.
 */
export const nextAttempt = (failures: number, cleanEnd: boolean, livedMs: number): { delay: number, failures: number } => {
    if (cleanEnd && livedMs >= HEALTHY_STREAM_MS) return { delay: 0, failures: 0 }
    const next = failures + 1
    return { delay: Math.min(60_000, 2_000 * 2 ** (next - 1)), failures: next }
}

/** The channel secret of this tab: random, created once, kept in sessionStorage (memory if blocked). */
let memorySecret: string | undefined
export const channelSecret = (): string => {
    const stored = safeSessionStorage.get(AGENT_SECRET_KEY)
    if (stored) return stored
    if (memorySecret) return memorySecret
    let secret: string
    try {
        const bytes = new Uint8Array(32)
        globalThis.crypto.getRandomValues(bytes)
        secret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    } catch {
        secret = nanoid(43)
    }
    if (!safeSessionStorage.set(AGENT_SECRET_KEY, secret)) memorySecret = secret
    return secret
}

// ── status store ───────────────────────────────────────────────────────────────────────────

const DISCONNECTED: AgentStatus = { connected: false, paired: false, agents: [] }
let status: AgentStatus = DISCONNECTED
const listeners = new Set<(s: AgentStatus) => void>()

const setStatus = (next: AgentStatus) => {
    status = next
    listeners.forEach((l) => { try { l(status) } catch { /* a listener's bug is its own */ } })
}

export const agentStatus = (): AgentStatus => status

/** Listens to the pairing status (called at once with the current one); returns the unsubscribe. */
export const subscribeAgentStatus = (listener: (s: AgentStatus) => void): (() => void) => {
    listeners.add(listener)
    listener(status)
    return () => { listeners.delete(listener) }
}

// ── the stream ─────────────────────────────────────────────────────────────────────────────

interface Target { baseUrl: string, route: string, serverSideType: string, origin: Element }

let target: Target | null = null
let controller: AbortController | null = null
let failures = 0
let reconnectTimer: ReturnType<typeof setTimeout> | undefined

const currentRoute = () => (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')

/** What one message does: status → the store; anything else → the shared agent-event handling. */
export const applyAgentPush = (origin: Element, push: AgentPush) => {
    if (push.kind === 'status' || push.event === AGENT_STATUS_EVENT) {
        setStatus({ ...status, ...statusOf(push.detail) })
        return
    }
    // the chat panel's own close: never something the channel can ask for
    if (push.event === CLOSE_REQUESTED) return
    applyAgentEvent(origin, push.event, push.detail)
}

const stopStream = () => {
    clearTimeout(reconnectTimer)
    reconnectTimer = undefined
    controller?.abort()
    controller = null
}

const schedule = (delay: number) => {
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => { reconnectTimer = undefined; if (target && !controller) connect() }, delay)
}

const connect = () => {
    if (!target || controller) return
    const own = new AbortController()
    controller = own
    const { baseUrl, route, serverSideType } = target
    const path = (route || '_no_route').replace(/^\/+/, '')
    const url = baseUrl + '/mateu/v3/sse/' + path
    const headers: Record<string, string> = { 'Accept': 'text/event-stream', 'Content-Type': 'application/json' }
    Object.assign(headers, credentialHeadersFor(url))
    const started = Date.now()
    let clean = false
    fetch(url, {
        method: 'POST',
        headers,
        signal: own.signal,
        body: JSON.stringify({
            serverSideType, appState: {}, componentState: {},
            parameters: { sessionId: sessionId(), secret: channelSecret(), route: currentRoute(), renderer: 'vaadin' },
            initiatorComponentId: 'mateu-agent-channel', consumedRoute: '', route: '/' + path,
            actionId: '_agent-channel',
        }),
    }).then(async (response) => {
        if (!response.ok || !response.body) throw new Error('agent channel: ' + response.status)
        setStatus({ ...status, connected: true })
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        const parser = new SseParser()
        const handle = (payload: string) => {
            const t = target
            if (!t || controller !== own) return
            for (const push of agentPushesOf(incrementOf(payload))) {
                try {
                    applyAgentPush(t.origin, push)
                } catch (e) {
                    console.warn('[mateu] agent push', e)
                }
            }
        }
        while (true) {
            const { value, done } = await reader.read()
            if (done) {
                parser.end().forEach(handle)
                break
            }
            parser.push(value).forEach(handle)
        }
        clean = true
    }).catch(() => {
        // an abort is ours (stopped or replaced); anything else is a failure, handled below
    }).finally(() => {
        if (controller !== own) return // stopped, or replaced
        controller = null
        setStatus({ ...status, connected: false })
        if (!target) return
        const next = nextAttempt(failures, clean, Date.now() - started)
        failures = next.failures
        schedule(next.delay)
    })
}

/**
 * Starts (or stops) the channel for the shell on show: `app.agentPush` on → this tab holds its
 * stream; off → it closes it. `origin` is the shell (pushed events are dispatched from it and the
 * built-in render target finds its content area). Called on every shell update; cheap when nothing
 * changed.
 */
export const syncAgentChannel = (app: App | undefined, baseUrl: string, origin: Element) => {
    const want = !!app?.agentPush && typeof window !== 'undefined' && typeof fetch === 'function'
    if (!want) {
        if (target) {
            target = null
            failures = 0
            stopStream()
            setStatus(DISCONNECTED)
        }
        return
    }
    const next: Target = { baseUrl, route: app!.rootRoute || '', serverSideType: app!.serverSideType ?? '', origin }
    const changed = !target || target.baseUrl !== next.baseUrl || target.serverSideType !== next.serverSideType
        || target.route !== next.route
    target = next
    if (changed) {
        failures = 0
        stopStream()
    }
    if (!controller && !reconnectTimer) connect()
}

// ── pairing ────────────────────────────────────────────────────────────────────────────────

const runAgentAction = (app: App, baseUrl: string, actionId: string, from: HTMLElement) =>
    mateuApiClient.runAction(baseUrl, app.rootRoute ?? '', '', actionId, 'mateu-agent-connect',
        undefined, app.serverSideType, {}, { sessionId: sessionId(), secret: channelSecret() }, from, true)

/** Asks for a new one-time pairing code (`_agent-pair`). Rejects when the server gives none. */
export const pairAgent = async (app: App, baseUrl: string, from: HTMLElement): Promise<AgentPairing> => {
    const pairing = pairingOf(await runAgentAction(app, baseUrl, '_agent-pair', from))
    if (!pairing) throw new Error('no pairing code')
    return pairing
}

/** Removes every pairing of this session (`_agent-unpair`); the channel is then told (a status). */
export const unpairAgent = async (app: App, baseUrl: string, from: HTMLElement): Promise<void> => {
    await runAgentAction(app, baseUrl, '_agent-unpair', from)
    setStatus({ ...status, paired: false, agents: [] })
}

/** For tests. */
export const resetAgentChannel = () => {
    target = null
    stopStream()
    failures = 0
    memorySecret = undefined
    status = DISCONNECTED
    listeners.clear()
}
