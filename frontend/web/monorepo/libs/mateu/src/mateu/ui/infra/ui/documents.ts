/**
 * Documents and printing — what the client does with a `DownloadFile` command and a `Print` one.
 *
 * A `DownloadFile` (an action returned a `Document`, or a listing export) carries the bytes
 * inline (`base64Content`) or a short-lived, single-use `url` under the UI's base URL; its
 * `disposition` says whether to SHOW the file (`inline`: a new tab with the browser's viewer) or
 * SAVE it (`attachment`, the default), and `print` asks for the print dialog.
 *
 *  - attachment → an `<a download>` click (anchored to the body: Safari/Firefox ignore a detached
 *    one), the object URL released LATER (revoking it in the same tick cancels the download in
 *    Firefox).
 *  - inline → a new tab. The response arrives after an async request, so a strict popup blocker
 *    may refuse it; then the file is downloaded instead, never lost.
 *  - print → a hidden iframe that loads the document and opens the print dialog for it (no tab,
 *    no popup); when the browser will not print the frame, a new tab, where the user prints it.
 *
 * `Print` prints the CURRENT page: a print stylesheet that leaves out the app chrome (navigation,
 * toolbars, buttons, floating buttons, overlays) is adopted into the document and every open
 * shadow root first — document-level CSS cannot cross a shadow boundary, and every Mateu screen
 * lives inside nested shadow roots. The sheet only applies under `@media print`, so it stays
 * attached harmlessly (and also serves the browser's own Ctrl+P).
 *
 * The browser is injected (`env`) so the logic is testable in node without a DOM.
 */

export interface FileDownloadData {
    filename?: string
    mimeType?: string
    base64Content?: string
    url?: string
    disposition?: 'inline' | 'attachment' | string
    print?: boolean
}

/** The part of `window` this module uses. */
export interface DocumentEnv {
    document: Document
    URL: { createObjectURL(b: Blob): string, revokeObjectURL(u: string): void }
    Blob: typeof Blob
    atob(s: string): string
    open(url: string, target?: string): Window | null
    print(): void
    setTimeout(cb: () => void, ms: number): unknown
}

export type DocumentOutcome = 'downloaded' | 'opened' | 'printing' | 'none'

/** How long an object URL lives once handed to a tab or a frame that still has to load it. */
export const OBJECT_URL_TTL_MS = 60_000

/**
 * The URL to fetch a server-parked document from, or undefined when the value is not one we will
 * follow (only same-site paths and http(s) URLs — a `javascript:` URL from the wire is refused).
 * A path is resolved against the origin of an absolute `baseUrl` (a renderer served from another
 * origin than its API, as in development).
 */
export function documentUrl(url: string | undefined, baseUrl?: string): string | undefined {
    if (!url) return undefined
    if (/^https?:\/\//i.test(url)) return url
    if (!url.startsWith('/') || url.startsWith('//')) return undefined
    if (baseUrl && /^https?:\/\//i.test(baseUrl)) {
        try {
            return new URL(url, new URL(baseUrl).origin).toString()
        } catch {
            return url
        }
    }
    return url
}

export function base64ToBytes(b64: string, atobFn: (s: string) => string): Uint8Array {
    const bin = atobFn(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
}

/** Where the bytes are: an object URL over the inline content, or the server URL. */
function hrefOf(data: FileDownloadData, env: DocumentEnv, baseUrl?: string): { href: string, objectUrl: boolean } | undefined {
    if (data.base64Content) {
        const blob = new env.Blob([base64ToBytes(data.base64Content, env.atob) as BlobPart], {
            type: data.mimeType || 'application/octet-stream',
        })
        return { href: env.URL.createObjectURL(blob), objectUrl: true }
    }
    const href = documentUrl(data.url, baseUrl)
    return href ? { href, objectUrl: false } : undefined
}

function release(href: { href: string, objectUrl: boolean }, env: DocumentEnv, delay: number) {
    if (href.objectUrl) env.setTimeout(() => env.URL.revokeObjectURL(href.href), delay)
}

function download(href: string, filename: string, env: DocumentEnv) {
    const a = env.document.createElement('a')
    a.href = href
    a.download = filename
    a.rel = 'noopener'
    a.style.display = 'none'
    env.document.body.appendChild(a)
    a.click()
    a.remove()
}

function printInFrame(href: string, env: DocumentEnv, onFail: () => void) {
    const frame = env.document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.setAttribute('tabindex', '-1')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
    frame.addEventListener('load', () => {
        try {
            const w = frame.contentWindow
            if (!w) throw new Error('no frame window')
            w.focus()
            w.print()
        } catch {
            onFail()
        }
        // the print dialog is modal in most browsers; the frame goes once it is surely closed
        env.setTimeout(() => frame.remove(), OBJECT_URL_TTL_MS)
    }, { once: true })
    frame.src = href
    env.document.body.appendChild(frame)
}

/** Shows, downloads or prints a `DownloadFile` payload. */
export function handleFileDownload(
    data: FileDownloadData | null | undefined,
    env: DocumentEnv = window as unknown as DocumentEnv,
    baseUrl?: string,
): DocumentOutcome {
    if (!data || typeof data !== 'object' || !env?.document) return 'none'
    const href = hrefOf(data, env, baseUrl)
    if (!href) return 'none'
    const filename = data.filename || 'download'
    const inline = data.disposition === 'inline'

    if (inline && data.print) {
        printInFrame(href.href, env, () => {
            // a server URL is single-use and the frame already spent it: a tab can only show an
            // object URL again. Either way the user is never left with nothing.
            if (href.objectUrl) env.open(href.href, '_blank')
        })
        release(href, env, OBJECT_URL_TTL_MS)
        return 'printing'
    }
    if (inline) {
        const tab = env.open(href.href, '_blank')
        if (tab) {
            try { tab.opener = null } catch { /* cross-origin: nothing to cut */ }
            release(href, env, OBJECT_URL_TTL_MS)
            return 'opened'
        }
        // a popup blocker refused the tab: download it rather than lose it
    }
    download(href.href, filename, env)
    release(href, env, 1000)
    return 'downloaded'
}

// ── printing the current page ──────────────────────────────────────────────────────────────────

/**
 * What the print stylesheet leaves out: the app shell's navigation and header, buttons and
 * menus, floating buttons, overlays and notifications, the skip link, banners about the
 * connection. `.mateu-no-print` / `[data-mateu-print="hide"]` opt anything else out;
 * `[data-mateu-print="show"]` keeps a control a screen wants on paper.
 */
export const PRINT_CSS = `
@media print {
    vaadin-app-layout::part(navbar), vaadin-app-layout::part(drawer),
    [slot="navbar"], [slot="drawer"], vaadin-drawer-toggle,
    vaadin-side-nav, vaadin-menu-bar, vaadin-tabs.app-tabs, nav,
    vaadin-button:not([data-mateu-print="show"]), button:not([data-mateu-print="show"]),
    .ai-fab, .app-fab, .page-fab, .page-toc, mateu-command-center, mateu-notification-bell,
    mateu-skip-link, mateu-connectivity-banner, mateu-app-context-picker,
    mateu-vaadin-app-context-picker, mateu-chat, mateu-filter-bar, mateu-action-panel,
    vaadin-notification-card, vaadin-tooltip-overlay, mateu-api-caller-veil,
    .mateu-no-print, [data-mateu-print="hide"] {
        display: none !important;
    }
    vaadin-app-layout { --_vaadin-app-layout-navbar-offset-size: 0 !important; padding: 0 !important; }
    vaadin-app-layout::part(content) { padding: 0 !important; margin: 0 !important; }
    vaadin-scroller, .app-content, [role="main"] {
        overflow: visible !important; height: auto !important; max-height: none !important;
    }
    * { box-shadow: none !important; }
}
`

const printRoots = new WeakSet<Document | ShadowRoot>()

function adoptPrintSheet(root: Document | ShadowRoot) {
    if (printRoots.has(root)) return
    printRoots.add(root)
    const adoptable = root as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }
    if (typeof CSSStyleSheet !== 'undefined' && Array.isArray(adoptable.adoptedStyleSheets)) {
        try {
            const sheet = new CSSStyleSheet()
            sheet.replaceSync(PRINT_CSS)
            adoptable.adoptedStyleSheets = [...adoptable.adoptedStyleSheets, sheet]
            return
        } catch {
            // fall through
        }
    }
    const container = root instanceof Document ? root.head : root
    if (!container) return
    const style = (root instanceof Document ? root : root.ownerDocument).createElement('style')
    style.setAttribute('data-mateu-print', 'styles')
    style.textContent = PRINT_CSS
    container.appendChild(style)
}

/** Every open shadow root under `root`, depth first. */
export function shadowRoots(root: Document | ShadowRoot): ShadowRoot[] {
    const found: ShadowRoot[] = []
    const visit = (node: Document | ShadowRoot | Element) => {
        const children = (node as ParentNode).querySelectorAll ? (node as ParentNode).querySelectorAll('*') : []
        children.forEach(el => {
            const sr = (el as Element).shadowRoot
            if (sr) {
                found.push(sr)
                visit(sr)
            }
        })
    }
    visit(root)
    return found
}

/** Adopts the print stylesheet into the document and every shadow root open right now. */
export function preparePrint(doc: Document = document): number {
    adoptPrintSheet(doc)
    const roots = shadowRoots(doc)
    roots.forEach(adoptPrintSheet)
    return roots.length + 1
}

/** The `Print` command: chrome-less print of the current page. */
export function printPage(env: DocumentEnv = window as unknown as DocumentEnv) {
    if (!env?.document) return
    preparePrint(env.document)
    env.print()
}

let beforePrintInstalled = false

/** Ctrl+P / the browser's menu print the page the same way the `Print` command does. */
export function installPrintSupport(win: Window | undefined = typeof window === 'undefined' ? undefined : window) {
    if (!win || beforePrintInstalled) return
    beforePrintInstalled = true
    win.addEventListener('beforeprint', () => preparePrint(win.document))
}
