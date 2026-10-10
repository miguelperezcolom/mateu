/**
 * The conversation between the visual editor and the Redwood canvas (an iframe running the real
 * Redwood/VB app in editor-preview mode — the bridge side is apps/redwood/poc/editorPreview.mjs).
 * Every message is a plain object tagged `{ mateuPreview: <kind> }`; postMessage, so the same
 * protocol works same-origin (the dev server, IntelliJ) and cross-origin (VS Code, whose webview
 * frames the app from the extension's loopback server).
 */
export const PREVIEW_KEY = 'mateuPreview'

/** A wire fragment: the first fragment of the increment the canvas renders. */
export type PreviewFragment = { component?: unknown; state?: unknown; data?: unknown; [k: string]: unknown }

export type EditorToFrame =
    | { mateuPreview: 'render'; fragment: PreviewFragment }
    | { mateuPreview: 'select'; id: string | null; label?: string; reveal?: boolean }
    /** PLAY mode: the answer to a `call` — what the app's backend would have said. */
    | { mateuPreview: 'answer'; id: number; status: number; json: unknown }
    /** PLAY mode: go to this route (Play's address bar, back/forward). */
    | { mateuPreview: 'navigate'; route: string }

export type FrameToEditor =
    /** The bridge is installed (the app is booting): it wants the current fragment. */
    | { mateuPreview: 'hello' }
    /** A render settled; `count` elements carry a node id. */
    | { mateuPreview: 'rendered'; count?: number }
    /** A click on the canvas: the node under it (null: nothing selectable there). */
    | { mateuPreview: 'click'; id: string | null }
    /** A key the editor handles (undo, delete, arrows), pressed while the frame had the focus. */
    | { mateuPreview: 'key'; key: string; code?: string; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }
    /** A boot script (Oracle's CDN) could not be loaded. */
    | { mateuPreview: 'boot-failed'; url: string }
    /** The host serves no Redwood app at all. */
    | { mateuPreview: 'unavailable'; reason?: string }
    /** PLAY mode: the app called its backend (`/mateu/v3/…`); the editor answers it (`answer`). */
    | { mateuPreview: 'call'; id: number; url: string; body: Record<string, unknown> }
    /** PLAY mode: the app's route changed (a menu entry, a row, a link) — Play's address bar follows. */
    | { mateuPreview: 'route'; route: string }

const KINDS = new Set(['hello', 'rendered', 'click', 'key', 'boot-failed', 'unavailable', 'call', 'route'])

/** The message, when it is one of the frame's; null for anything else posted to the window. */
export function frameMessageOf(data: unknown): FrameToEditor | null {
    if (!data || typeof data !== 'object') return null
    const kind = (data as Record<string, unknown>)[PREVIEW_KEY]
    return typeof kind === 'string' && KINDS.has(kind) ? (data as FrameToEditor) : null
}

export const renderMessage = (fragment: PreviewFragment): EditorToFrame => ({ [PREVIEW_KEY]: 'render', fragment: JSON.parse(JSON.stringify(fragment)) } as EditorToFrame)

export const selectMessage = (id: string | null, label = '', reveal = false): EditorToFrame =>
    ({ [PREVIEW_KEY]: 'select', id, label, reveal } as EditorToFrame)

/**
 * Where the Redwood canvas page is: the host may say (VS Code frames it from its loopback server,
 * `window.__mateuRedwoodPreview`), otherwise it sits next to the editor's own page.
 */
export function redwoodPreviewUrl(win: { __mateuRedwoodPreview?: string; location: { href: string } } = window as any): string {
    return win.__mateuRedwoodPreview || new URL('redwood-preview.html', win.location.href).toString()
}

/**
 * The Redwood PLAY page: the same page as the canvas, in play mode (`?play`) — the app runs for real
 * (menu, routes, buttons) and its backend calls come to the editor — opened on `route` (hash mode).
 */
export function redwoodPlayUrl(route: string, win: { __mateuRedwoodPreview?: string; location: { href: string } } = window as any): string {
    const u = new URL(redwoodPreviewUrl(win))
    u.searchParams.set('play', '1')
    u.hash = '/' + (route ?? '').replace(/^\/+/, '')
    return u.toString()
}

export const answerMessage = (id: number, status: number, json: unknown): EditorToFrame =>
    ({ [PREVIEW_KEY]: 'answer', id, status, json } as EditorToFrame)

export const navigateMessage = (route: string): EditorToFrame =>
    ({ [PREVIEW_KEY]: 'navigate', route } as EditorToFrame)

/** How long the app may take to say hello before the canvas reports it did not start. */
export const BOOT_TIMEOUT_MS = 45_000
