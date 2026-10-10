/**
 * The Redwood canvas's page: the REAL Redwood renderer — the Visual Builder app packaged in the
 * `io.mateu:redwood` jar — booted inside an iframe in editor-preview mode.
 *
 * The packaged page (`_index.html`) is a template for the controller a Mateu backend generates: its
 * boot scripts are parked as `type="text/mateu-deferred"` (require.js, the bundles config, the
 * visual-runtime — all from Oracle's CDN) and the controller injects the script that promotes them
 * in order (`IndexPage.DEFERRED_BOOT` in core). The editor has no controller, so this module does
 * the same: it reads `_index.html` from wherever the host serves the app (`<prefix>_index.html` +
 * `<prefix>_redwood/…`), re-anchors it under that prefix, sets the editor flag the bridge looks for
 * (`window.__mateuEditorPreview`, poc/editorPreview.mjs) and replays the boot scripts.
 *
 * If a script cannot be loaded — Oracle's CDN is unreachable, blocked by a proxy or a CSP — it says
 * so to the editor (`boot-failed`), which shows an offline notice instead of a blank canvas.
 */
import { PREVIEW_KEY, type FrameToEditor } from '../canvas/redwoodProtocol'

/** Re-anchors the packaged page at `prefix` (an absolute path ending in `/`, e.g. `/redwood/`). */
export function adaptIndexHtml(html: string, prefix: string): string {
    return html
        // relative URLs (the app's css) resolve against the prefix, not the origin root
        .replace(/<base href="[^"]*">/, `<base href="${prefix}">`)
        // the visual-runtime derives its module base from BASE_URL (it ignores <base>)
        .replace(/BASE_URL: '\/?_redwood\/'/, `BASE_URL: '${prefix}_redwood/'`)
}

/** The parked boot scripts, in document order. */
export function deferredScripts(doc: Document): HTMLScriptElement[] {
    return Array.from(doc.querySelectorAll('script')).filter((s) => s.type === 'text/mateu-deferred')
}

const tell = (msg: FrameToEditor) => {
    try { window.parent.postMessage(msg, '*') } catch { /* no editor around: a plain tab */ }
}

/** Replays the parked scripts IN ORDER, awaiting each (they depend on one another). */
export function replayDeferred(doc: Document, onFail: (url: string) => void): void {
    const parked = deferredScripts(doc)
    let i = 0
    const next = () => {
        if (i >= parked.length) return
        const old = parked[i++]
        const s = doc.createElement('script')
        for (const a of Array.from(old.attributes)) {
            if (a.name !== 'type' && a.name !== 'data-src') s.setAttribute(a.name, a.value)
        }
        const src = old.getAttribute('data-src')
        if (src) {
            s.onload = next
            s.onerror = () => onFail(src)
            s.src = src
        } else {
            s.text = old.textContent ?? ''
        }
        old.parentNode?.replaceChild(s, old)
        if (!src) next()
    }
    next()
}

function showProblem(title: string, detail: string) {
    const box = document.createElement('div')
    box.setAttribute('role', 'alert')
    box.setAttribute('style', 'font:14px/1.5 system-ui,sans-serif;max-width:36rem;margin:12vh auto;padding:1.25rem;color:#1a1a1a;background:#fff;border:1px solid #ddd;border-radius:8px')
    box.innerHTML = '<h1 style="font-size:1.1rem;margin:0 0 .5rem"></h1><p style="margin:0;word-break:break-word"></p>'
    box.querySelector('h1')!.textContent = title
    box.querySelector('p')!.textContent = detail
    document.body.appendChild(box)
}

/** Boots the packaged Redwood app in editor-preview mode, from `prefix` (default: `redwood/`). */
export async function bootRedwoodPreview(prefix = new URL('redwood/', location.href).pathname): Promise<void> {
    ;(window as any).__mateuEditorPreview = true
    let html: string
    try {
        const res = await fetch(prefix + '_index.html')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        html = await res.text()
    } catch (e: any) {
        tell({ [PREVIEW_KEY]: 'unavailable', reason: e?.message ?? String(e) })
        showProblem('The Redwood renderer is not available here',
            `${prefix}_index.html could not be loaded (${e?.message ?? e}). Build the editor with the io.mateu:redwood app bundled, or point it at a backend that serves it.`)
        return
    }
    const parsed = new DOMParser().parseFromString(adaptIndexHtml(html, prefix), 'text/html')
    // <base> first, so everything inserted after it (the app's css) resolves under the prefix
    for (const n of Array.from(parsed.head.childNodes)) document.head.appendChild(document.importNode(n, true))
    const base = document.head.querySelector('base')
    if (base) document.head.insertBefore(base, document.head.firstChild)
    for (const a of Array.from(parsed.documentElement.attributes)) document.documentElement.setAttribute(a.name, a.value)
    for (const a of Array.from(parsed.body.attributes)) document.body.setAttribute(a.name, a.value)
    for (const n of Array.from(parsed.body.childNodes)) document.body.appendChild(document.importNode(n, true))
    replayDeferred(document, (url) => {
        tell({ [PREVIEW_KEY]: 'boot-failed', url })
        showProblem('Redwood could not start',
            `A script it needs could not be loaded: ${url}. The Redwood renderer loads Oracle JET and the Visual Builder runtime from Oracle's CDN (static.oracle.com) — check the network connection, or whether a proxy or a content security policy blocks it.`)
    })
}
