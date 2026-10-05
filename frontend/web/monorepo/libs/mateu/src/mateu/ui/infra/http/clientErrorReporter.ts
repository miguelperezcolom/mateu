/**
 * Client errors → server log. What this renderer shows or suffers (a classified transport failure
 * toasted to the user, an uncaught JS error, an unhandled promise rejection) is posted to
 * `POST <baseUrl>/mateu/v3/client-log`, which writes ONE `client-error {...}` line per report on
 * the `mateu.client` logger. Same contract as the Redwood renderer (apps/redwood/poc/clientLog.mjs).
 *
 * Why: an error the user saw ("Your session is no longer valid") left no trace server-side when the
 * request never reached the app — a gateway rejecting it, the network dropping it — or when the
 * failure was the browser's own. Now there is a line to look for.
 *
 * Rules:
 *  - never reports its own failures (the call does not go through axios or the toasts, its errors
 *    are swallowed, and a report whose url is the endpoint is discarded): no loops;
 *  - `cancelled` is not an error;
 *  - the same error repeated within the window is ONE line with `count` + firstAt/lastAt: the first
 *    occurrence goes out promptly, repeats go in one summary line when the window closes (or when
 *    the page is hidden);
 *  - at most `maxPerMinute` lines per minute and page; the ones that do not fit are counted in the
 *    next line's `dropped`;
 *  - an answer saying there is no endpoint (404/405, or a backend without it that swallows the
 *    report as an action) turns it off for the page — see endpointIsMissing.
 *
 * Sending is fetch keepalive WITH the Authorization header (the gateway requires the Bearer on
 * /mateu/v3); sendBeacon cannot carry headers, so it is only the last resort on pagehide when there
 * is no token.
 */

export const CLIENT_LOG_PATH = '/mateu/v3/client-log'

export interface ClientErrorInput {
    kind?: string
    message?: string
    detail?: string
    status?: number
    url?: string
    route?: string
    actionId?: string
    source?: string
    traceparent?: string
    stack?: string
}

export interface ClientErrorLine extends ClientErrorInput {
    level: 'error'
    kind: string
    count: number
    firstAt: string
    lastAt: string
    dropped?: number
    renderer?: string
    userAgent?: string
    pageUrl?: string
}

export type ClientLogSend = (url: string, body: string, options: { final: boolean }) => Promise<number | undefined> | number | undefined

export interface ClientErrorReporterDeps {
    send: ClientLogSend
    renderer?: string
    endpoint?: () => string | null
    now?: () => number
    schedule?: (fn: () => void, ms: number) => unknown
    cancel?: (handle: unknown) => void
    dedupeWindowMs?: number
    batchDelayMs?: number
    maxPerMinute?: number
    userAgent?: string
    pageUrl?: () => string | undefined
}

const MAX = { message: 1000, detail: 1000, stack: 4000, url: 1000, pageUrl: 1000, source: 500, route: 500, actionId: 200, userAgent: 300 }
const MAX_BATCH_CHARS = 14000
const SECRET_PARAMS = /^(code|state|session_state|token|access_token|id_token|refresh_token|auth|password)$/i

const clip = (s: unknown, max: number): string | undefined => {
    if (s === undefined || s === null) return undefined
    const text = String(s)
    return text.length > max ? text.slice(0, max) + '…' : text
}

const decodeSafe = (s: string) => {
    try { return decodeURIComponent(s) } catch { return s }
}

/** The URL without its fragment and with sensitive query values masked. */
export const redactUrl = (url: string | undefined): string | undefined => {
    if (!url) return url
    const noHash = String(url).split('#')[0]
    const q = noHash.indexOf('?')
    if (q < 0) return noHash
    const params = noHash.slice(q + 1).split('&').map((pair) => {
        const eq = pair.indexOf('=')
        const key = eq < 0 ? pair : pair.slice(0, eq)
        return SECRET_PARAMS.test(decodeSafe(key)) ? `${key}=***` : pair
    })
    return noHash.slice(0, q + 1) + params.join('&')
}

/** The Mateu route of a transport URL (/mateu/v3/sync/<route>), or undefined. */
export const routeOfRequestUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined
    const m = /\/mateu\/v3\/(?:sync|sse)\/([^?#]*)/.exec(url)
    if (!m) return undefined
    return m[1] === '_no_route' ? '' : '/' + m[1]
}

/**
 * Whether the answer says there is no endpoint here: a 404/405 (an older backend, or
 * mateu.client-log.enabled=false), or a backend whose generic /mateu/v3/** controller swallowed the
 * report as if it were an action (a 2xx other than 204, a 400, a 500). Transient answers — none,
 * a 401/403 from an expired token, 413, 429, a gateway's 502-504 — do not turn it off.
 */
export const endpointIsMissing = (status: number | undefined | null): boolean => {
    if (status === undefined || status === null || status === 0 || status === 204) return false
    if (status === 401 || status === 403 || status === 413 || status === 429 || status >= 502) return false
    return true
}

/** Only same-origin: another origin would get neither our token nor CORS. */
export const clientLogEndpointOf = (base: string | undefined, origin: string | undefined): string | null => {
    const b = base ?? ''
    if (/^https?:\/\//i.test(b) && (!origin || b.indexOf(origin) !== 0)) return null
    return b.replace(/\/+$/, '') + CLIENT_LOG_PATH
}

interface Entry {
    report: ClientErrorInput & { level: 'error', kind: string }
    windowStart: number
    pending: number
    pendingFirstAt: number
    lastAt: number
    sent: boolean
}

export interface ClientErrorReporter {
    report(input: ClientErrorInput | undefined | null): void
    flush(final?: boolean): void
    isDisabled(): boolean
    pendingCount(): number
}

export const createClientErrorReporter = (deps: ClientErrorReporterDeps): ClientErrorReporter => {
    const renderer = deps.renderer ?? 'vaadin'
    const now = deps.now ?? (() => Date.now())
    const schedule = deps.schedule ?? ((fn: () => void, ms: number) => setTimeout(fn, ms))
    const cancel = deps.cancel ?? ((h: unknown) => clearTimeout(h as ReturnType<typeof setTimeout>))
    const windowMs = deps.dedupeWindowMs ?? 60000
    const batchDelayMs = deps.batchDelayMs ?? 2000
    const maxPerMinute = deps.maxPerMinute ?? 20
    const endpoint = deps.endpoint ?? (() => CLIENT_LOG_PATH)

    const entries = new Map<string, Entry>()
    let sentAt: number[] = []
    let dropped = 0
    let disabled = false
    let timer: unknown = null
    let dueAt = Infinity

    const keyOf = (r: ClientErrorInput) =>
        [r.kind, r.status, r.message, r.url, r.actionId, (r.stack ?? '').split('\n')[0]].join('|')

    const plan = (ms: number) => {
        const at = now() + Math.max(0, ms)
        if (timer !== null && at >= dueAt) return
        if (timer !== null) cancel(timer)
        dueAt = at
        timer = schedule(() => { timer = null; dueAt = Infinity; flush(false) }, Math.max(0, ms))
    }

    const report = (input: ClientErrorInput | undefined | null) => {
        try {
            if (disabled || !input) return
            if (input.kind === 'cancelled') return
            const url = input.url ? String(input.url) : undefined
            if (url && url.indexOf(CLIENT_LOG_PATH) >= 0) return
            if (/ResizeObserver loop/i.test(input.message ?? '')) return
            const t = now()
            const r = {
                level: 'error' as const,
                kind: input.kind ?? 'unknown',
                message: clip(input.message, MAX.message),
                detail: clip(input.detail, MAX.detail),
                status: typeof input.status === 'number' ? input.status : undefined,
                url: clip(redactUrl(url), MAX.url),
                route: clip(input.route !== undefined ? input.route : routeOfRequestUrl(url), MAX.route),
                actionId: clip(input.actionId, MAX.actionId),
                source: clip(input.source, MAX.source),
                traceparent: input.traceparent,
                stack: clip(input.stack, MAX.stack),
            }
            const key = keyOf(r)
            const existing = entries.get(key)
            if (existing && t - existing.windowStart < windowMs) {
                if (existing.pending === 0) existing.pendingFirstAt = t
                existing.pending++
                existing.lastAt = t
                plan(existing.windowStart + windowMs - t)
                return
            }
            entries.set(key, { report: r, windowStart: t, pending: 1, pendingFirstAt: t, lastAt: t, sent: false })
            plan(batchDelayMs)
        } catch {
            // reporting can never break the page
        }
    }

    const takeDue = (final: boolean): ClientErrorLine[] => {
        const t = now()
        const lines: ClientErrorLine[] = []
        for (const [key, e] of entries) {
            const expired = t - e.windowStart >= windowMs
            if (e.pending > 0 && (!e.sent || expired || final)) {
                lines.push({
                    ...e.report,
                    count: e.pending,
                    firstAt: new Date(e.pendingFirstAt).toISOString(),
                    lastAt: new Date(e.lastAt).toISOString(),
                })
                e.pending = 0
                e.sent = true
            }
            if (expired && e.pending === 0) entries.delete(key)
        }
        return lines
    }

    const admit = (lines: ClientErrorLine[]): ClientErrorLine[] => {
        const t = now()
        sentAt = sentAt.filter((s) => t - s < 60000)
        // `dropped` on a line = the ones lost BEFORE it, in earlier sends
        const before = dropped
        const out: ClientErrorLine[] = []
        for (const line of lines) {
            if (sentAt.length >= maxPerMinute) { dropped++; continue }
            sentAt.push(t)
            out.push(line)
        }
        if (out.length && before) { out[0].dropped = before; dropped -= before }
        return out
    }

    const batches = (lines: ClientErrorLine[]): ClientErrorLine[][] => {
        const out: ClientErrorLine[][] = []
        let current: ClientErrorLine[] = []
        let size = 2
        for (const line of lines) {
            const length = JSON.stringify(line).length + 1
            if (current.length && size + length > MAX_BATCH_CHARS) {
                out.push(current)
                current = []
                size = 2
            }
            current.push(line)
            size += length
        }
        if (current.length) out.push(current)
        return out
    }

    const flush = (final = false) => {
        try {
            if (disabled) return
            const url = endpoint()
            if (!url) return
            const common = {
                renderer,
                userAgent: clip(deps.userAgent, MAX.userAgent),
                pageUrl: clip(redactUrl(deps.pageUrl?.()), MAX.pageUrl),
            }
            const lines = admit(takeDue(final))
                .map((l) => JSON.parse(JSON.stringify({ ...common, ...l })) as ClientErrorLine)
            for (const batch of batches(lines)) {
                let sent: Promise<number | undefined> | number | undefined
                try { sent = deps.send(url, JSON.stringify(batch), { final }) } catch { sent = undefined }
                Promise.resolve(sent).then((status) => {
                    if (endpointIsMissing(status)) disabled = true
                }, () => { /* a lost report is not reported */ })
            }
            let next = Infinity
            for (const e of entries.values()) {
                if (e.pending > 0) next = Math.min(next, e.windowStart + windowMs)
            }
            if (next !== Infinity && !final) plan(next - now())
        } catch {
            // idem
        }
    }

    return {
        report,
        flush,
        isDisabled: () => disabled,
        pendingCount: () => entries.size,
    }
}

/**
 * The real sender: fetch keepalive with the token (the gateway requires it); on pagehide and with
 * no token, sendBeacon as a last resort. Resolves with the status, or undefined.
 */
export const clientLogSender = (headers: () => Record<string, string> = () => ({})): ClientLogSend =>
    (url, body, { final }) => {
        const auth = headers() ?? {}
        const hasAuth = Object.keys(auth).length > 0
        if (final && !hasAuth && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            try {
                navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
                return Promise.resolve(undefined)
            } catch {
                // fall through to fetch
            }
        }
        if (typeof fetch === 'undefined') return Promise.resolve(undefined)
        return fetch(url, {
            method: 'POST',
            keepalive: true,
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', ...auth },
            body,
        }).then((res) => res.status, () => undefined)
    }

/** The token the bootstrap left, as a header (same source as AxiosMateuApiClient). */
export const storedAuthHeaders = (): Record<string, string> => {
    try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('__mateu_auth_token') : null
        return token ? { Authorization: 'Bearer ' + token } : {}
    } catch {
        return {}
    }
}

/**
 * The report for a failure the user is shown: the classified failure plus what lay underneath (an
 * axios error's URL, status and traceparent; any other error's message and stack).
 */
export const failureReportOf = (
    failure: { kind: string, message: string, status?: number },
    reason: unknown,
    actionId?: string,
): ClientErrorInput => {
    const r = (reason ?? {}) as {
        message?: string, stack?: string,
        config?: { url?: string, baseURL?: string, headers?: Record<string, unknown> },
        response?: { status?: number },
    }
    const isHttp = !!r.config || !!r.response
    const traceparent = r.config?.headers?.['traceparent']
    return {
        kind: failure.kind,
        message: failure.message,
        status: failure.status ?? r.response?.status,
        detail: typeof reason === 'string' ? reason : r.message,
        url: r.config?.url,
        actionId,
        traceparent: typeof traceparent === 'string' ? traceparent : undefined,
        // an HTTP failure's stack is axios internals; anything else's is where it broke
        stack: isHttp ? undefined : r.stack,
    }
}

let pageReporter: ClientErrorReporter | null = null

/** Reports to the page's reporter; a no-op until {@link installClientErrorReporting}. */
export const reportClientError = (input: ClientErrorInput) => {
    pageReporter?.report(input)
}

/** For tests: replaces (or clears) the page's reporter. */
export const setClientErrorReporter = (reporter: ClientErrorReporter | null) => {
    pageReporter = reporter
}

/**
 * Hooks the page: uncaught errors, unhandled rejections and the flush on pagehide. Idempotent —
 * the first top-level `<mateu-ui>` wins (its base URL is the app's).
 */
export const installClientErrorReporting = (baseUrl: string | undefined): ClientErrorReporter | null => {
    if (pageReporter || typeof window === 'undefined') return pageReporter
    const origin = window.location?.origin
    const reporter = createClientErrorReporter({
        renderer: 'vaadin',
        endpoint: () => clientLogEndpointOf(baseUrl, origin),
        send: clientLogSender(storedAuthHeaders),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        pageUrl: () => window.location?.href,
    })
    pageReporter = reporter
    window.addEventListener('error', (event: ErrorEvent) => {
        // a resource that fails to load (img/script) arrives here with no error and no message
        if (!event || (!event.error && !event.message)) return
        const err = event.error as Error | undefined
        reporter.report({
            kind: 'js-error',
            message: event.message || err?.message,
            stack: err?.stack,
            source: event.filename ? `${event.filename}:${event.lineno ?? 0}:${event.colno ?? 0}` : undefined,
        })
    })
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        const reason = event?.reason as { message?: string, stack?: string, name?: string, code?: string,
            __mateuReported?: boolean, isAxiosError?: boolean } | undefined
        // a transport failure already toasted (and reported) is not reported twice; an abort is ours
        if (reason?.__mateuReported || reason?.code === 'ERR_CANCELED' || reason?.name === 'AbortError') return
        let message = reason?.message
        if (!message) {
            try { message = typeof reason === 'string' ? reason : JSON.stringify(reason) } catch { message = String(reason) }
        }
        reporter.report({ kind: 'unhandled-rejection', message, stack: reason?.stack })
    })
    window.addEventListener('pagehide', () => reporter.flush(true))
    return reporter
}
