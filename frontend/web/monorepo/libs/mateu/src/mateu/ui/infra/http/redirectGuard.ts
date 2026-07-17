// Lost-session redirect guard: when the app sits behind container-managed auth (basic auth /
// form login) and the session dies (e.g. the server restarted), API calls get a 302 to the
// login page. The browser follows redirects TRANSPARENTLY, so axios never sees the 302 — it
// receives a 200 whose final URL (XMLHttpRequest.responseURL) is the login page and whose body
// is HTML instead of the expected JSON. The user just saw the action silently do nothing.
//
// This guard detects that shape — the request was redirected AND the payload is not JSON —
// and returns the final URL so the caller can send the BROWSER there to re-authenticate.
// A redirect that still answers JSON (e.g. a trailing-slash rewrite) is left alone.

export interface RedirectedResponseLike {
    /** The URL the client asked for (may be relative — resolved against `base`). */
    requestedUrl: string
    /** XMLHttpRequest.responseURL — the final URL after the browser followed redirects. */
    finalUrl?: string
    /** The response content-type header, if any. */
    contentType?: string
    /** The response body as axios parsed it (object for JSON, string for HTML). */
    data?: unknown
}

const looksLikeJson = (contentType: string, data: unknown): boolean => {
    if (contentType.includes('json')) return true
    // axios parses JSON into an object even when the content-type header is missing
    return data !== null && typeof data === 'object'
}

export const loginRedirectTarget = (
    response: RedirectedResponseLike,
    base?: string,
): string | undefined => {
    const finalUrl = response.finalUrl
    if (!finalUrl) {
        // adapter didn't expose the final URL — nothing to compare against
        return undefined
    }
    const baseHref = base ?? (typeof window !== 'undefined' ? window.location.href : undefined)
    let requested: string
    try {
        requested = new URL(response.requestedUrl, baseHref).href
    } catch {
        return undefined
    }
    if (requested === finalUrl) {
        // no redirect happened
        return undefined
    }
    if (looksLikeJson(response.contentType ?? '', response.data)) {
        // redirected, but the API still answered — not a login page
        return undefined
    }
    return finalUrl
}
