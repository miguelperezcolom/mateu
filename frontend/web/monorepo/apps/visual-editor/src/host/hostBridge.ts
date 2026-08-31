/**
 * The thin contract between the web editor and its host (IntelliJ JCEF / VSCode Webview /
 * standalone browser). The host owns file I/O and the backend base URL; the editor owns the
 * UI. Kept deliberately minimal — everything else (preview, contract) the editor fetches
 * itself from `baseUrl`.
 */
import { SAMPLE_YAML } from '../model/catalog'
import type { ProjectFile } from '../model/projectIndex'

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
    }
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
        channel.addEventListener?.('message', (e) => this.onMessage(e))
        window.addEventListener('message', (e) => this.onMessage(e))
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

    baseUrl() { return window.__mateuBaseUrl ?? '' }

    async initialYaml() {
        return localStorage.getItem(this.key) ?? SAMPLE_YAML
    }

    /** The path of the edited file for standalone dev, if set (enables data-source binding pickers). */
    currentPath() {
        return localStorage.getItem('mateu-visual-editor-path') ?? undefined
    }

    // Standalone has no IDE and no native save, so a local edit is kept as a localStorage draft.
    onContentChanged(yaml: string) {
        localStorage.setItem(this.key, yaml)
    }

    async listFiles(): Promise<ProjectFile[]> {
        const raw = localStorage.getItem(this.projectKey)
        if (!raw) return []
        try {
            const map = JSON.parse(raw) as Record<string, string>
            return Object.entries(map).map(([path, content]) => ({ path, content }))
        } catch {
            return []
        }
    }
}
