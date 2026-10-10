import * as fs from 'fs'
import * as path from 'path'

/**
 * What the loopback server answers for a GET that is not a Mateu call: the Redwood canvas. A webview
 * cannot host the Redwood/VB app itself (its pages resolve modules from absolute paths, which a
 * `vscode-webview://` origin does not have), so the editor frames it from this server instead:
 *
 *  - `/redwood-preview.html` and its `/assets/…` — the canvas page, from the bundle (`media/`);
 *  - `/redwood/…` — the Redwood/VB app of io.mateu:mateu-redwood, which the editor's build copies into the
 *    bundle under `redwood/`; a bundle without it falls back to the configured backend's own Redwood
 *    app (`/redwood/x` → `<backend>/x`, what a backend depending on io.mateu:mateu-redwood serves at root).
 *
 * JET, the Spectra components and the VB runtime are never served from here: Oracle's CDN.
 */
export type StaticAnswer =
    | { kind: 'file'; file: string; contentType: string }
    | { kind: 'backend'; path: string }
    | { kind: 'none' }

const TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.md': 'text/markdown',
}

export function staticAnswerOf(mediaDir: string | undefined, urlPath: string): StaticAnswer {
    let p: string
    // a malformed escape (the VB page asks for its own `%{env.…}%` placeholders) is no file of ours
    try { p = decodeURIComponent(urlPath.split('?')[0]) } catch { return { kind: 'none' } }
    const servable = p === '/redwood-preview.html' || p.startsWith('/assets/') || p.startsWith('/redwood/')
    if (!servable || p.split('/').includes('..')) return { kind: 'none' }
    if (mediaDir) {
        const file = path.join(mediaDir, p)
        if (file.startsWith(path.resolve(mediaDir) + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
            return { kind: 'file', file, contentType: TYPES[path.extname(file)] ?? 'application/octet-stream' }
        }
    }
    if (p.startsWith('/redwood/') && p.length > '/redwood/'.length) {
        return { kind: 'backend', path: p.slice('/redwood'.length) + (urlPath.includes('?') ? urlPath.slice(urlPath.indexOf('?')) : '') }
    }
    return { kind: 'none' }
}
