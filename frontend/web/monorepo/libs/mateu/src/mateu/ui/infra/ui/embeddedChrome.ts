/**
 * A micro frontend EMBEDDED in a page (`MicroFrontend.chrome` on the wire) is a block of that
 * page, not a page of its own. Its `mateu-ux` carries the chrome as an attribute
 * (`embedded-chrome`), and everything inside it asks here:
 *
 * - the window is the host's: no SetWindowTitle / SetFavicon / PushStateToHistory from inside is
 *   applied (the remote's server is told not to send them — `embeddedChrome` on every request —
 *   but an older remote still does), and its address-bar moves are not forwarded;
 * - no breadcrumb of its own (it would trace the HOST's menu and URL);
 * - its page header: NONE hides it, COMPACT keeps only the actions, PAGE keeps it all.
 */
export type EmbeddedChrome = 'NONE' | 'COMPACT' | 'PAGE'

export const EMBEDDED_CHROME_ATTRIBUTE = 'embedded-chrome'

/** The window's commands: never applied from inside an embedded micro frontend. */
export const WINDOW_COMMANDS: ReadonlySet<string> = new Set(['SetWindowTitle', 'SetFavicon', 'PushStateToHistory'])

/** A chrome value as the wire sends it, or undefined (top-level) for anything else. */
export const chromeOf = (value: unknown): EmbeddedChrome | undefined => {
    const v = typeof value === 'string' ? value.trim().toUpperCase() : ''
    return v === 'NONE' || v === 'COMPACT' || v === 'PAGE' ? v : undefined
}

/** The parent of a node, crossing out of a shadow root to its host. */
const parentOf = (node: Node): Node | null => {
    const el = node as Element
    if (el.parentElement) return el.parentElement
    const root = node.getRootNode?.() as ShadowRoot | Document | undefined
    if (root && root !== node && (root as ShadowRoot).host) return (root as ShadowRoot).host
    return node.parentNode && node.parentNode !== root ? node.parentNode : null
}

const isUx = (node: Node): node is Element =>
    (node as Element).tagName === 'MATEU-UX'

/**
 * The chrome of the nearest embedded micro frontend `node` lives in (itself included), or
 * undefined when it is not inside one — for what belongs to the window (commands, breadcrumbs):
 * anything nested anywhere inside an embed is embedded.
 */
export const embeddingChromeOf = (node: Node | null | undefined): EmbeddedChrome | undefined => {
    let current: Node | null = node ?? null
    let guard = 0
    while (current && guard++ < 500) {
        if (isUx(current)) {
            const chrome = chromeOf((current as Element).getAttribute?.(EMBEDDED_CHROME_ATTRIBUTE))
            if (chrome) return chrome
        }
        current = parentOf(current)
    }
    return undefined
}

/**
 * The chrome of the embedded micro frontend whose OWN page `node` belongs to: only when the
 * nearest `mateu-ux` above it is the embedded one — for the page header, so a nested view's
 * header (an island inside the remote's page) is not stripped as well.
 */
export const ownEmbeddedChromeOf = (node: Node | null | undefined): EmbeddedChrome | undefined => {
    let current: Node | null = node ? parentOf(node) : null
    let guard = 0
    while (current && guard++ < 500) {
        if (isUx(current)) return chromeOf((current as Element).getAttribute?.(EMBEDDED_CHROME_ATTRIBUTE))
        current = parentOf(current)
    }
    return undefined
}

/** Whether a command must not be applied from where `node` lives. */
export const isSuppressedWindowCommand = (type: string | undefined, node: Node | null | undefined): boolean =>
    !!type && WINDOW_COMMANDS.has(type) && embeddingChromeOf(node) !== undefined
