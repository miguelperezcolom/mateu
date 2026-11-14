/**
 * Which backend a Mateu URL belongs to — the key the version-skew watch (buildWatch.ts) and the
 * structure cache's namespaces (routeStructureCache.ts) are kept per. Its own module, free of any
 * UI import, so the cache can use it.
 */
/** The backend a Mateu URL belongs to: its absolute form up to (excluding) the `/mateu/` segment. */
export function backendKeyOf(url: string, base?: string): string | undefined {
    let href = url
    try {
        const fallbackBase = base ?? (typeof window !== 'undefined' && window.location ? window.location.href : undefined)
        href = new URL(url, fallbackBase).href
    } catch {
        // not resolvable — keep it as written
    }
    const at = href.indexOf('/mateu/')
    return at < 0 ? undefined : href.substring(0, at)
}
