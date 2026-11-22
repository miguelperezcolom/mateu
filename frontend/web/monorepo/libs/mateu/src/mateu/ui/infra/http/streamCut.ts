// An SSE answer that comes back as a gateway error page instead of the stream: a proxy between the
// page and the server (a CDN rewrite, typically) cut it or buffered it until its own timeout — e.g.
// Netlify's proxy answers a long stream with an HTML 504 "Inactivity Timeout" after ~30 s. The
// user is told that, instead of the raw HTML page as the error text (SSEService).

/** True when an SSE request's failed answer looks like a proxy's, not Mateu's (Mateu answers JSON). */
export function isStreamCutByProxy(status: number, body: string | null | undefined): boolean {
    if (status !== 502 && status !== 503 && status !== 504) return false
    const text = String(body ?? '').trim()
    if (!text) return true
    try {
        JSON.parse(text)
        return false
    } catch {
        return true
    }
}
