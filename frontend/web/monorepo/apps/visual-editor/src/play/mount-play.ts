import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { keyed } from 'lit/directives/keyed.js'
import { nanoid } from 'nanoid'
import { loadBundleManifest } from '@infra/http/bundleStore.ts'
import { setRestSourceCatalogue } from '@infra/http/restSourceCatalogue.ts'
import '@infra/ui/mateu-api-caller.ts'
import '@infra/ui/mateu-ux.ts'
import type { ProjectFile } from '../model/projectIndex'
import { buildPlayManifest } from '../model/playManifest'

/** The viewport widths play can pretend to be: what the app looks like on a desk, a tablet, a phone. */
export const PLAY_WIDTHS = { desktop: 0, tablet: 768, phone: 390 } as const
export type PlayWidth = keyof typeof PLAY_WIDTHS

/**
 * Play mode (m3e-canvas's "try it"): the mount RUNNING, from the files as edited — click a menu
 * entry, a row, a button, and you land where the app would take you. No backend needed for a
 * definition-only mount: the files become a specs-mode manifest and the shared runtime expands each
 * route in the browser, exactly as a statically deployed bundle does. A route served by a view model
 * falls through to `baseUrl` (the preview backend), when there is one.
 *
 * It plays the part `mateu-ui` plays in an app — the one that owns the address bar — but over a
 * history of its OWN: `mateu-ui` drives `window.history`, and the editor's page is not the app's.
 * So the screen's navigations (`url-update-requested`, `navigate-to-requested`) stop here and move
 * the fake address bar instead. Emits `play-close`.
 */
@customElement('mount-play')
export class MountPlay extends LitElement {
    static styles = css`
        :host { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--ve-surface, #f3f4f6); }
        .chrome { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.6rem; background: var(--ve-base, #fff);
                  border-bottom: 1px solid var(--ve-border, #e3e5e8); font: 12px var(--ve-font, system-ui); }
        .chrome button { font: 500 12px var(--ve-font, system-ui); color: var(--ve-text, #1f2937); background: transparent;
                         border: 1px solid transparent; border-radius: 6px; padding: 0.25rem 0.5rem; cursor: pointer; }
        .chrome button:hover:not(:disabled) { background: var(--ve-hover, #f1f3f5); }
        .chrome button:disabled { opacity: .4; cursor: default; }
        .chrome button.close { border-color: var(--ve-input-border, #d7dade); }
        .address { flex: 1; min-width: 6rem; display: flex; align-items: center; gap: 0.3rem; border: 1px solid var(--ve-input-border, #d7dade);
                   border-radius: 999px; padding: 0.2rem 0.7rem; background: var(--ve-surface, #f7f8fa); }
        .address input { flex: 1; min-width: 0; border: none; background: transparent; outline: none;
                         font: 12px ui-monospace, monospace; color: var(--ve-text, #1f2937); }
        .address .scheme { color: var(--ve-tertiary, #9ca3af); font: 12px ui-monospace, monospace; }
        select { font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 4px;
                 padding: 0.2rem 0.3rem; background: var(--ve-base, #fff); color: var(--ve-text, #1f2937); }
        .badge { font-size: 11px; padding: 0.05rem 0.5rem; border-radius: 999px; background: var(--ve-success-10, #e7f6ec); color: var(--ve-success, #13703a); }
        .stage { flex: 1; min-height: 0; overflow: auto; display: flex; justify-content: center; }
        .device { background: var(--ve-canvas-bg, #fff); min-height: 100%; width: 100%; box-sizing: border-box; }
        .device.framed { margin: 1rem 0; min-height: calc(100% - 2rem); border-radius: 14px; box-shadow: 0 0 0 1px var(--ve-border, #e3e5e8), 0 8px 30px rgba(0,0,0,.12); overflow: hidden; }
        mateu-api-caller, mateu-ux { display: block; }
    `

    /** The mount's files, the edited one already laid over its saved copy. */
    @property({ attribute: false }) files: ProjectFile[] = []
    /** The route play opens on ('' = the mount root). */
    @property() start = ''
    /** The backend for what the browser cannot expand (view-model routes, server actions); '' = none. */
    @property() baseUrl = ''
    @property() theme: 'light' | 'dark' = 'light'
    /** The catalogue the editor's canvas resolves `ref`s against, put back when play closes. */
    @property({ attribute: false }) editorSources: unknown[] = []

    @state() private history: string[] = []
    @state() private at = -1
    @state() private width: PlayWidth = 'desktop'
    @state() private ready = false
    /** Bumped to mount the screen afresh (a reload, a back/forward). */
    @state() private navKey = nanoid()
    @state() private instant = nanoid()
    @state() private typed?: string

    private get route(): string { return this.history[this.at] ?? '' }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('url-update-requested', this.onUrlUpdate)
        this.addEventListener('navigate-to-requested', this.onNavigateTo)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('url-update-requested', this.onUrlUpdate)
        this.removeEventListener('navigate-to-requested', this.onNavigateTo)
        // Leave the runtime as the editor had it: no bundle answering route loads, the canvas's catalogue.
        loadBundleManifest('mateu-play-manifest.json', emptyFetch).then(() => setRestSourceCatalogue(this.editorSources as never))
    }

    protected willUpdate(changed: PropertyValues) {
        if (changed.has('files')) this.loadManifest()
        if (changed.has('start') && this.at < 0) { this.history = [clean(this.start)]; this.at = 0 }
    }

    private loadManifest() {
        const manifest = JSON.stringify(buildPlayManifest(this.files))
        const fetchImpl = (async () => new Response(manifest, { headers: { 'content-type': 'application/json' } })) as unknown as typeof fetch
        this.ready = false
        loadBundleManifest('mateu-play-manifest.json', fetchImpl).then(() => {
            this.ready = true
            this.reload()
        })
    }

    render() {
        const w = PLAY_WIDTHS[this.width]
        return html`
            <div class="chrome">
                <button title="Back" ?disabled=${this.at <= 0} @click=${() => this.go(this.at - 1)}>◀</button>
                <button title="Forward" ?disabled=${this.at >= this.history.length - 1} @click=${() => this.go(this.at + 1)}>▶</button>
                <button title="Reload" @click=${this.reload}>⟳</button>
                <label class="address" title="Type a route and press Enter">
                    <span class="scheme">app/</span>
                    <input .value=${this.typed ?? this.route} @input=${(e: Event) => (this.typed = (e.target as HTMLInputElement).value)}
                           @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.navigate(this.typed ?? this.route) }} />
                </label>
                <select title="Viewport width" @change=${(e: Event) => (this.width = (e.target as HTMLSelectElement).value as PlayWidth)}>
                    ${(Object.keys(PLAY_WIDTHS) as PlayWidth[]).map((k) => html`<option value=${k} ?selected=${k === this.width}>${label(k)}</option>`)}
                </select>
                <span class="badge" title="The files as edited, run in the browser — nothing is saved or deployed">playing</span>
                <button class="close" title="Back to the editor (Esc)" @click=${this.close}>Close</button>
            </div>
            <div class="stage">
                <div class="device ${w ? 'framed' : ''}" style=${w ? `width:${w}px; flex:none` : ''}>
                    ${this.ready ? keyed(this.navKey, html`
                        <mateu-api-caller>
                            <mateu-ux id="_ux" baseurl=${this.baseUrl} route=${this.route} consumedRoute="_empty"
                                      instant=${this.instant} top="true" theme=${this.theme}></mateu-ux>
                        </mateu-api-caller>`) : ''}
                </div>
            </div>`
    }

    /** Navigate to a route as a fresh load (the address bar, a reference picked on the board). */
    navigate(route: string) {
        const r = clean(route)
        this.push(r)
        this.typed = undefined
        this.reload()
    }

    private push(route: string) {
        if (route === this.route) return
        this.history = [...this.history.slice(0, this.at + 1), route]
        this.at = this.history.length - 1
    }

    private go(i: number) {
        if (i < 0 || i >= this.history.length) return
        this.at = i
        this.typed = undefined
        this.reload()
    }

    private reload = () => {
        this.navKey = nanoid()
        this.instant = nanoid()
    }

    private close = () => this.dispatchEvent(new CustomEvent('play-close', { bubbles: true, composed: true }))

    /** The screen changed the URL (a menu entry, a mediator's own push): move the address bar. */
    private onUrlUpdate = (e: Event) => {
        e.stopPropagation()
        const route = (e as CustomEvent).detail?.route
        if (typeof route === 'string') { this.push(clean(route)); this.typed = undefined }
    }

    /** The screen asked to GO somewhere (a link, a row, a save landing): load it, as mateu-ui does. */
    private onNavigateTo = (e: Event) => {
        e.stopPropagation()
        const route = (e as CustomEvent).detail?.route
        if (typeof route !== 'string') return
        this.push(clean(route))
        this.typed = undefined
        const ux = this.renderRoot.querySelector('mateu-ux')
        if (ux) {
            ux.setAttribute('route', this.route)
            ux.setAttribute('instant', nanoid())
        }
    }
}

const emptyFetch = (async () => new Response('{}')) as unknown as typeof fetch

/** A route as the address bar shows it: no leading slash, no origin. */
function clean(route: string): string {
    let r = (route ?? '').trim()
    try { if (/^https?:\/\//.test(r)) { const u = new URL(r); r = u.pathname + u.search } } catch { /* not a URL */ }
    return r.replace(/^\/+/, '')
}

function label(w: PlayWidth): string {
    return w === 'desktop' ? 'Desktop' : w === 'tablet' ? 'Tablet · 768' : 'Phone · 390'
}

declare global {
    interface HTMLElementTagNameMap { 'mount-play': MountPlay }
}
