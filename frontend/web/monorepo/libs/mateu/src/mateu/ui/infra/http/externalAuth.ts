// Client-side secure auth for DIRECT (non-proxy) external REST fetches. A host app registers a
// provider that supplies auth headers (e.g. an Authorization bearer token read from a secure
// store) at fetch time; the renderer merges them into every direct @RestOptions/@RestListing/
// @RestAction/@RestData request. The token stays on the client and never rides the Mateu wire —
// the client-direct counterpart of the server-side `proxy` mode (which injects ${secret.X}
// server-side). The proxy path never calls this (it fetches server-to-server).

export interface ExternalAuthContext {
    /** The interpolated endpoint URL about to be fetched. */
    url: string
    /** The HTTP method (uppercased). */
    method: string
}

/** Supplies auth headers for a direct external fetch; may be async (e.g. refresh a token). */
export type ExternalAuthProvider = (
    ctx: ExternalAuthContext,
) => Record<string, string> | undefined | Promise<Record<string, string> | undefined>

let provider: ExternalAuthProvider | undefined

/**
 * Register (or clear, with `undefined`) the auth-header provider consulted before every DIRECT
 * external REST fetch. Its headers are merged LAST, so they win over any statically declared
 * header of the same name. Ignored on the proxy path (secrets are injected server-side there).
 */
export function registerExternalAuthProvider(p: ExternalAuthProvider | undefined): void {
    provider = p
}

/** Resolve the auth headers for a direct external fetch — `{}` when no provider is registered or
 *  the provider throws (a failing token lookup must not break the fetch outright). */
export async function externalAuthHeaders(ctx: ExternalAuthContext): Promise<Record<string, string>> {
    if (!provider) return {}
    try {
        return (await provider(ctx)) ?? {}
    } catch (e) {
        console.warn('mateu: external auth provider failed', e)
        return {}
    }
}
