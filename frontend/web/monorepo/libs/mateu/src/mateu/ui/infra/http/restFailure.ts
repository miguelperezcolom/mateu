import { chromeTextf } from '@infra/ui/chromeTexts.ts'
import { UnknownRestSourceError } from '@infra/http/restSourceCatalogue.ts'
import { ExternalRestError } from '@infra/http/serviceMessage.ts'

/**
 * What the user is told when a REST source call fails — ONE wording for every surface (a REST
 * action, a listing's rows): what the service said (its error body) when it said something, else
 * the generic "request failed (HTTP n)"; a source nobody declared is named, so it can be reported.
 */
export function restFailureText(e: unknown): string {
    if (e instanceof UnknownRestSourceError) return chromeTextf('unknownRestSource', { name: e.sourceName })
    if (e instanceof ExternalRestError) return e.detail ?? chromeTextf('requestFailed', { status: ` (HTTP ${e.status})` })
    if (e instanceof ProxiedRestError) return e.detail ?? chromeTextf('requestFailed', { status: e.status > 0 ? ` (HTTP ${e.status})` : '' })
    return chromeTextf('requestFailed', { status: '' })
}

/** How long that message stays: a configuration mistake until it is read, a failure 3 s. */
export const restFailureDuration = (e: unknown): number => e instanceof UnknownRestSourceError ? 0 : 3000

/**
 * A PROXIED call the server reports as failed (`appData._restfetchError {status, detail}`): the
 * server no longer swallows an upstream 4xx/5xx into an empty body that reads as success.
 */
export class ProxiedRestError extends Error {
    constructor(readonly status: number, readonly detail: string | undefined) {
        super(`Proxied REST fetch failed: ${status}`)
        this.name = 'ProxiedRestError'
    }
}

/** The proxied failure an increment carries, or undefined when the call succeeded. */
export function proxiedFailureOf(uiIncrement: any): ProxiedRestError | undefined {
    const err = uiIncrement?.appData?.['_restfetchError']
    if (!err) return undefined
    const status = typeof err?.status === 'number' ? err.status : 0
    const detail = typeof err?.detail === 'string' && err.detail.trim() ? err.detail : undefined
    return new ProxiedRestError(status, detail)
}
