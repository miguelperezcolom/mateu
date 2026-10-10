/**
 * The thin contract between the web editor and its host (IntelliJ JCEF / VSCode Webview /
 * standalone browser). The host owns file I/O and the backend base URL; the editor owns the
 * UI. Kept deliberately minimal — everything else (preview, contract) the editor fetches
 * itself from `baseUrl`.
 */
import { SAMPLE_YAML } from '../model/catalog'
import type { ProjectFile } from '../model/projectIndex'
import { decodeShared, hasSharedDesign, type SharedDesign } from '../model/shareLink'

export interface HostBridge {
    /** The Mateu backend base URL (`''` = same-origin; the dev server proxies `/mateu`). */
    baseUrl(): string
    /** The initial YAML to edit. */
    initialYaml(): Promise<string>
    /**
     * The path of the file being edited, relative to `specs/ui/` (e.g. `orders.yaml`), or undefined
     * when the host cannot say. Used to resolve the page's data source through the route graph (which
     * route serves this definition → its view model). Available after `initialYaml()` resolves.
     */
    currentPath?(): string | undefined
    /**
     * The mount's authored files (project awareness) — every `specs/ui/**` file with its content, so
     * the editor can resolve cross-file references (a route's page, a menu's route, a partial). A
     * host with no project view (or none wired yet) returns `[]`; the editor then falls back to
     * typing the reference by hand.
     */
    listFiles?(): Promise<ProjectFile[]>
    /**
     * A local edit happened (the content changed but is NOT yet saved). An IDE host uses it to mark
     * its document dirty so the IDE's OWN save (Ctrl+S / save-all / close-prompt) writes the file —
     * there is no save button and this never writes the file itself. A standalone browser keeps it
     * as a localStorage draft.
     */
    onContentChanged?(yaml: string): void
    /**
     * A shared design was opened in the editor (its YAML is already the edited file's content). A host
     * that can hold a whole mount takes the rest of it — the path and the other files — here. The IDE
     * hosts write one file per editor, so they leave this out and only the opened file is loaded.
     */
    adoptShared?(design: SharedDesign): void
    /**
     * Open another file of the mount (the board's Edit). Resolves to its YAML when the editor should
     * switch to it in place (the standalone browser, which edits one draft at a time), or undefined
     * when the host opened it itself — an IDE opens it in a tab of its own.
     */
    openFile?(path: string): Promise<string | undefined>
    /** Subscribe to out-of-band file changes (the file edited elsewhere). Optional. */
    onExternalChange?(cb: (yaml: string) => void): void
}

/**
 * A message-based bridge shared by the IDE hosts. Both IntelliJ (JCEF) and VSCode inject a
 * `postMessage`-capable channel; this adapter speaks the same small protocol over it. Detected
 * at runtime via a global the host sets before loading the bundle.
 */
type HostChannel = {
    postMessage(msg: unknown): void
    addEventListener?(type: 'message', cb: (e: MessageEvent) => void): void
}

declare global {
    interface Window {
        // VSCode injects acquireVsCodeApi(); a JCEF host can inject window.__mateuHost.
        acquireVsCodeApi?: () => HostChannel
        __mateuHost?: HostChannel
        __mateuBaseUrl?: string
        /** The address a share link should open (a hosted editor); defaults to the page's own URL. */
        __mateuEditorUrl?: string
        /** The origin of an embedding host that posts from a parent frame, when it is not the page's own. */
        __mateuHostOrigin?: string
    }
}

/** The parts of a MessageEvent the trust check reads. */
export interface HostMessageLike {
    source: unknown
    origin: string
}

/** The parts of the window the trust check reads. */
export interface HostWindowLike {
    parent: unknown
    location: { origin: string }
    __mateuHostOrigin?: string
}

/**
 * Whether a `message` event comes from the editor's HOST and not from any other frame or window.
 *
 * The window-level listener used to accept every message, so any page able to get a reference to
 * this window (an opener, a sibling iframe, a page that framed the editor) could post an `init` and
 * replace the YAML being edited — which the IDE then saves. A host message is accepted only when:
 *  - it was posted by THIS window (the JCEF host injects `window.postMessage(…)` into the page) and
 *    carries the page's own origin; or
 *  - it was posted by the PARENT frame (a webview host such as VSCode embeds the editor in a frame)
 *    from the page's own origin, a `vscode-webview:` origin, or the origin the host declared in
 *    `window.__mateuHostOrigin`.
 */
export const isTrustedHostMessage = (e: HostMessageLike, win: HostWindowLike): boolean => {
    const own = win.location.origin
    if (e.source === win) return e.origin === own
    const framed = win.parent !== undefined && win.parent !== null && win.parent !== win
    if (framed && e.source === win.parent) {
        return e.origin === own
            || e.origin.startsWith('vscode-webview:')
            || (!!win.__mateuHostOrigin && e.origin === win.__mateuHostOrigin)
    }
    return false
}

/** Resolve the active bridge: an IDE host if present, else the standalone browser bridge. */
export function resolveHost(): HostBridge {
    const channel: HostChannel | undefined =
        (typeof window.acquireVsCodeApi === 'function' ? window.acquireVsCodeApi() : undefined) ??
        window.__mateuHost
    if (channel) return new MessageHost(channel)
    return new BrowserHost()
}

/** IDE host over postMessage. init → {yaml, baseUrl}; the editor posts {type:'contentChanged', yaml}. */
class MessageHost implements HostBridge {
    private _baseUrl = window.__mateuBaseUrl ?? ''
    private _resolveInit!: (yaml: string) => void
    private _init = new Promise<string>((r) => (this._resolveInit = r))
    private _external?: (yaml: string) => void
    private _resolveFiles?: (files: ProjectFile[]) => void
    private _path?: string

    constructor(private channel: HostChannel) {
        // the channel's own events come from the host by construction
        channel.addEventListener?.('message', (e) => this.onMessage(e))
        // window messages can come from ANY frame or window: only the host's are read
        window.addEventListener('message', (e) => {
            if (isTrustedHostMessage(e, window as unknown as HostWindowLike)) this.onMessage(e)
        })
        channel.postMessage({ type: 'ready' })
    }

    private onMessage(e: MessageEvent) {
        const msg = e.data
        if (!msg || typeof msg !== 'object') return
        if (msg.type === 'init') {
            if (typeof msg.baseUrl === 'string') this._baseUrl = msg.baseUrl
            if (typeof msg.path === 'string') this._path = msg.path
            this._resolveInit(msg.yaml ?? '')
        } else if (msg.type === 'externalChange') {
            this._external?.(msg.yaml ?? '')
        } else if (msg.type === 'files') {
            this._resolveFiles?.(Array.isArray(msg.files) ? msg.files : [])
            this._resolveFiles = undefined
        }
    }

    baseUrl() { return this._baseUrl }
    initialYaml() { return this._init }
    currentPath() { return this._path }
    onContentChanged(yaml: string) { this.channel.postMessage({ type: 'contentChanged', yaml }) }
    onExternalChange(cb: (yaml: string) => void) { this._external = cb }
    /** The IDE opens the file in an editor of its own; this one stays on its file. */
    openFile(path: string): Promise<string | undefined> {
        this.channel.postMessage({ type: 'openFile', path })
        return Promise.resolve(undefined)
    }

    /** Ask the IDE host for the project's files; resolve empty if it does not answer (not yet wired). */
    listFiles(): Promise<ProjectFile[]> {
        this.channel.postMessage({ type: 'listFiles' })
        return new Promise((resolve) => {
            this._resolveFiles = resolve
            setTimeout(() => {
                if (this._resolveFiles) { this._resolveFiles = undefined; resolve([]) }
            }, 1500)
        })
    }
}

/** Standalone browser bridge: persists to localStorage, seeds from the URL or a sample. */
class BrowserHost implements HostBridge {
    private key = 'mateu-visual-editor-yaml'
    /** A whole mount for standalone dev: a `{path: yaml}` JSON map. Enables the reference pickers. */
    private projectKey = 'mateu-visual-editor-project'
    private pathKey = 'mateu-visual-editor-path'
    /** A design arriving in the URL (`#mateuz=…`) is imported once, before anything reads the draft. */
    private imported: Promise<void> = this.importSharedDesign()

    baseUrl() { return window.__mateuBaseUrl ?? '' }

    async initialYaml() {
        await this.imported
        return localStorage.getItem(this.key) ?? SAMPLE_YAML
    }

    /** The path of the edited file for standalone dev, if set (enables data-source binding pickers). */
    currentPath() {
        return localStorage.getItem(this.pathKey) ?? undefined
    }

    // Standalone has no IDE and no native save, so a local edit is kept as a localStorage draft.
    onContentChanged(yaml: string) {
        localStorage.setItem(this.key, yaml)
    }

    async listFiles(): Promise<ProjectFile[]> {
        await this.imported
        const raw = localStorage.getItem(this.projectKey)
        if (!raw) return []
        try {
            const map = JSON.parse(raw) as Record<string, string>
            return Object.entries(map).map(([path, content]) => ({ path, content }))
        } catch {
            return []
        }
    }

    /**
     * Switch the draft to another file of the mount: the current draft goes back into the project map
     * first (it is the only copy of its edits), then the other file becomes the draft.
     */
    async openFile(path: string) {
        await this.imported
        let map: Record<string, string> = {}
        try { map = JSON.parse(localStorage.getItem(this.projectKey) ?? '{}') } catch { /* start empty */ }
        if (!(path in map)) return undefined
        const current = this.currentPath()
        const draft = localStorage.getItem(this.key)
        if (current && draft !== null) map[current] = draft
        localStorage.setItem(this.projectKey, JSON.stringify(map))
        localStorage.setItem(this.pathKey, path)
        localStorage.setItem(this.key, map[path])
        return map[path]
    }

    /**
     * Open a shared link: the design becomes the draft (the previous one is kept under a `.previous`
     * key, so a stray link never destroys work) and the fragment is cleared, so a reload shows the
     * edits rather than re-importing the original.
     */
    private async importSharedDesign() {
        if (!hasSharedDesign(location.hash)) return
        const design = await decodeShared(location.hash)
        history.replaceState(null, '', location.pathname + location.search)
        if (!design) return
        for (const k of [this.key, this.pathKey, this.projectKey]) {
            const old = localStorage.getItem(k)
            if (old !== null) localStorage.setItem(k + '.previous', old)
        }
        localStorage.setItem(this.key, design.yaml)
        this.adoptShared(design)
    }

    adoptShared(design: SharedDesign) {
        if (design.path) localStorage.setItem(this.pathKey, design.path)
        else localStorage.removeItem(this.pathKey)
        if (design.files) {
            const files = { ...design.files, ...(design.path ? { [design.path]: design.yaml } : {}) }
            localStorage.setItem(this.projectKey, JSON.stringify(files))
        } else localStorage.removeItem(this.projectKey)
    }
}
