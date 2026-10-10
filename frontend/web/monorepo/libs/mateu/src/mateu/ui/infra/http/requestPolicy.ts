import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'

/**
 * Request policy — turns a transport failure into something a USER can act on.
 *
 * Until this module existed, a failed sync call surfaced `error.message` from axios verbatim:
 * "Network Error", "timeout of 60000ms exceeded", "Request failed with status code 500". That
 * text says nothing about what happened, whether it was the user's fault, or whether trying
 * again is worth it — precisely the three things that matter when the backend is slow or the
 * connection is poor.
 *
 * Everything here is pure so it can be unit-tested without a browser or a server. Two decisions
 * come out of a failure:
 *   - `message`: what to tell the user (the toast text),
 *   - `retryable`: whether re-sending the SAME request could plausibly succeed. Note this is only
 *     half of the retry decision — the other half is whether the ACTION is safe to repeat, which
 *     lives in {@link ./retryPolicy}. Both must say yes before anything is re-sent.
 */

export type RequestFailureKind =
    /** The browser reports no connectivity, or the request never reached the network. */
    | 'offline'
    /** The request left but no answer came back in time. */
    | 'timeout'
    /** The server answered, but with a 5xx. */
    | 'server'
    /** Credentials missing or expired (401): the re-auth flow's business. */
    | 'unauthorized'
    /**
     * The server knows who you are and refuses THIS (403): a role you lack, or an action/view the
     * app does not expose (the wire-type allowlist). Signing in again fixes none of that, so it is
     * not presented as an expired session.
     */
    | 'forbidden'
    /** The target is gone (404/410). */
    | 'notFound'
    /** Any other 4xx: the request itself was rejected. */
    | 'client'
    /** Deliberately aborted (navigation, loop guard) — not a failure to report. */
    | 'cancelled'
    | 'unknown'

export interface RequestFailure {
    kind: RequestFailureKind
    /** Written for the user, not for the console. Empty for `cancelled`. */
    message: string
    /** Whether re-sending this very request could plausibly succeed. */
    retryable: boolean
    /** HTTP status when the server did answer. */
    status?: number
}

/** Shape we read off an axios error without depending on axios types. */
interface TransportError {
    code?: string
    message?: string
    response?: { status?: number }
}

const errorStatus = (status?: number): string => (status ? chromeTextf('errorStatus', { status }) : '')

// every message in the page's language (chromeTexts)
const messages: Record<RequestFailureKind, (status?: number) => string> = {
    offline: () => chromeText('failOffline'),
    timeout: () => chromeText('failTimeout'),
    server: (status) => chromeTextf('failServer', { status: errorStatus(status) }),
    unauthorized: () => chromeText('failUnauthorized'),
    forbidden: () => chromeText('forbidden'),
    notFound: () => chromeText('failNotFound'),
    client: (status) => chromeTextf('failClient', { status: errorStatus(status) }),
    cancelled: () => '',
    unknown: () => chromeText('failUnknown'),
}

/** Kinds worth re-sending: the request either never arrived or hit a transient server condition. */
const RETRYABLE: ReadonlySet<RequestFailureKind> = new Set<RequestFailureKind>([
    'offline',
    'timeout',
    'server',
])

/**
 * Classifies a transport failure.
 *
 * `online` is injectable so the decision is testable and so callers can pass a connectivity
 * signal more trustworthy than `navigator.onLine` (which reports "online" for a captive portal
 * or a dead uplink). Defaults to the browser's own flag, and to `true` outside a browser.
 */
export const classifyRequestFailure = (
    error: unknown,
    options: { online?: boolean } = {},
): RequestFailure => {
    const err = (error ?? {}) as TransportError
    const status = err.response?.status
    const code = err.code
    const online = options.online
        ?? (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true)

    const failure = (kind: RequestFailureKind): RequestFailure => ({
        kind,
        message: messages[kind](status),
        retryable: RETRYABLE.has(kind),
        status,
    })

    // An abort is a decision we took (navigation, loop guard), never something to report.
    // axios raises ERR_CANCELED for an aborted signal and ECONNABORTED when its own timeout fires.
    if (code === 'ERR_CANCELED') return failure('cancelled')
    if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || /timeout/i.test(err.message ?? '')) {
        return failure('timeout')
    }
    // No response at all: either we know we're offline, or the request died before arriving.
    if (status === undefined) {
        if (!online) return failure('offline')
        if (code === 'ERR_NETWORK' || /network error/i.test(err.message ?? '')) return failure('offline')
        return failure('unknown')
    }
    if (status === 401) return failure('unauthorized')
    if (status === 403) return failure('forbidden')
    if (status === 404 || status === 410) return failure('notFound')
    // 408 Request Timeout / 429 Too Many Requests / 503 are all "come back in a moment".
    if (status === 408 || status === 429) return failure('timeout')
    if (status >= 500) return failure('server')
    if (status >= 400) return failure('client')
    return failure('unknown')
}

/** Convenience for call sites that only need the user-facing text. */
export const describeRequestFailure = (error: unknown, options?: { online?: boolean }): string =>
    classifyRequestFailure(error, options).message

/**
 * Whether the user should be offered to send the request again by hand. A refusal (403) answers
 * the same to the same request: a Retry next to "you are not allowed" only invites a second no.
 */
export const offersManualRetry = (failure: Pick<RequestFailure, 'kind'>): boolean =>
    failure.kind !== 'forbidden'
