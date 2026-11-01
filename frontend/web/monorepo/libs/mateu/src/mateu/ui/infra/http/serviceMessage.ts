/**
 * What a failed REST call's error body says, for a person — so a refused write reads "Image larger
 * than 2 MB" instead of "Request failed (HTTP 400)".
 *
 * A JSON object's `message`, `detail` (RFC 7807), `error` (a string, or an object with a message) or
 * `title`, in that order; else the body itself when it is short plain text (never HTML, never a
 * list). Control characters out, whitespace folded, at most 300 characters; undefined when there is
 * nothing worth showing. It is shown as TEXT (a toast), never as markup.
 *
 * The same rule runs on the server for a proxied call (RestProxyCalls.serviceMessageOf, which puts
 * it on `_restfetchError.detail`) and in Redwood (poc/restSources.mjs serviceMessageOf).
 */
export const SERVICE_MESSAGE_MAX = 300

export function serviceMessageOf(body: unknown): string | undefined {
    if (body == null) return undefined
    if (typeof body === 'object') return fromObject(body as Record<string, unknown>)
    const text = String(body).trim()
    if (!text) return undefined
    if (text.startsWith('{')) {
        try {
            return fromObject(JSON.parse(text))
        } catch {
            return undefined
        }
    }
    if (text.startsWith('<') || text.startsWith('[') || text.length > SERVICE_MESSAGE_MAX) return undefined
    return clipped(text)
}

function fromObject(json: Record<string, unknown> | null): string | undefined {
    if (!json || typeof json !== 'object' || Array.isArray(json)) return undefined
    for (const key of ['message', 'detail', 'error', 'title']) {
        const value = json[key]
        if (typeof value === 'string' && value.trim()) return clipped(value)
        if (value && typeof value === 'object') {
            const nested = (value as Record<string, unknown>).message
            if (typeof nested === 'string' && nested.trim()) return clipped(nested)
        }
    }
    return undefined
}

function clipped(text: string): string | undefined {
    // eslint-disable-next-line no-control-regex
    const clean = text.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim()
    if (!clean) return undefined
    return clean.length > SERVICE_MESSAGE_MAX ? clean.slice(0, SERVICE_MESSAGE_MAX - 1) + '…' : clean
}

/** A direct REST call answered with an error status; `detail` is what the service said, if anything. */
export class ExternalRestError extends Error {
    constructor(readonly status: number, readonly detail: string | undefined) {
        super(`External REST fetch failed: ${status}`)
        this.name = 'ExternalRestError'
    }
}
