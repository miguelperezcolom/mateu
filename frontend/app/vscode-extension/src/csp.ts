import { parse } from 'yaml'

/**
 * The webview's `connect-src`: who the visual editor may talk to. Deliberately NOT "any https host":
 * only the extension's loopback proxy, a local dev API on loopback, the configured `mateu.baseUrl`
 * origin, and the origins of the REST sources the project declares in its `sources.yaml` — the
 * endpoints a listing/option field/action fetches straight from the browser, as the app does.
 */
export function connectSrc(proxyOrigin: string, baseUrl: string | undefined, sourceOrigins: string[]): string {
    const all = [
        proxyOrigin,
        'http://localhost:*', 'http://127.0.0.1:*', 'https://localhost:*', 'https://127.0.0.1:*',
        originOf(baseUrl),
        ...sourceOrigins,
    ].filter((o): o is string => !!o)
    return [...new Set(all)].join(' ')
}

/**
 * The origins of every REST source declared in these files (any file with a top-level `sources:`
 * list). A url's origin is read up to its first `${…}` interpolation; a url whose HOST is
 * interpolated cannot be known up front and is skipped (it would need the proxy).
 */
export function sourceOrigins(fileTexts: string[]): string[] {
    const out = new Set<string>()
    for (const text of fileTexts) {
        let root: any
        try { root = parse(text) } catch { continue }
        const list = Array.isArray(root?.sources) ? root.sources : []
        for (const entry of list) {
            const url = entry?.source?.url
            const o = typeof url === 'string' ? originOf(url.split('${')[0]) : undefined
            if (o) out.add(o)
        }
    }
    return [...out].sort()
}

function originOf(url: string | undefined): string | undefined {
    if (!url || !/^https?:\/\//i.test(url.trim())) return undefined
    try {
        const u = new URL(url.trim())
        // A url cut at an interpolation inside the host ("https://api-") is not a real origin.
        return u.hostname && !u.hostname.endsWith('-') && !u.hostname.endsWith('.') ? u.origin : undefined
    } catch { return undefined }
}
