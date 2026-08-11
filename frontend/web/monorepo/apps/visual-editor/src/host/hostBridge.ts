/**
 * The thin contract between the web editor and its host (IntelliJ JCEF / VSCode Webview /
 * standalone browser). The host owns file I/O and the backend base URL; the editor owns the
 * UI. Kept deliberately minimal — everything else (preview, contract) the editor fetches
 * itself from `baseUrl`.
 */
import { SAMPLE_YAML } from '../model/catalog'

export interface HostBridge {
    /** The Mateu backend base URL (`''` = same-origin; the dev server proxies `/mateu`). */
    baseUrl(): string
    /** The initial YAML to edit. */
    initialYaml(): Promise<string>
    /** Persist the edited YAML back to the host (the open file). */
    save(yaml: string): void
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

/** IDE host over postMessage. init → {yaml, baseUrl}; the editor posts {type:'save', yaml}. */
class MessageHost implements HostBridge {
    private _baseUrl = window.__mateuBaseUrl ?? ''
    private _resolveInit!: (yaml: string) => void
    private _init = new Promise<string>((r) => (this._resolveInit = r))
    private _external?: (yaml: string) => void

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
            this._resolveInit(msg.yaml ?? '')
        } else if (msg.type === 'externalChange') {
            this._external?.(msg.yaml ?? '')
        }
    }

    baseUrl() { return this._baseUrl }
    initialYaml() { return this._init }
    save(yaml: string) { this.channel.postMessage({ type: 'save', yaml }) }
    onExternalChange(cb: (yaml: string) => void) { this._external = cb }
}

/** Standalone browser bridge: persists to localStorage, seeds from the URL or a sample. */
class BrowserHost implements HostBridge {
    private key = 'mateu-visual-editor-yaml'

    baseUrl() { return window.__mateuBaseUrl ?? '' }

    async initialYaml() {
        return localStorage.getItem(this.key) ?? SAMPLE_YAML
    }

    save(yaml: string) {
        localStorage.setItem(this.key, yaml)
    }
}
