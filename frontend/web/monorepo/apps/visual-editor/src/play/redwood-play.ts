import { LitElement, css, html, PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { awaitBundle, resolveBundledLoad } from '@infra/http/bundleStore.ts'
import {
    BOOT_TIMEOUT_MS, answerMessage, frameMessageOf, navigateMessage, redwoodPlayUrl, type FrameToEditor,
} from '../canvas/redwoodProtocol'
import { answerPlayCall, routeOfHash } from '../model/redwoodPlay'

/**
 * Play, in Redwood: the REAL Redwood renderer (the Visual Builder app of io.mateu:redwood) running
 * the whole mount in an iframe — the same page as the Redwood canvas, in play mode. Unlike the
 * canvas it is not inert: the menu navigates, rows open records, buttons run. Its backend is this
 * element: every `/mateu/v3/…` call the app makes arrives here (`call`) and is answered from the
 * files as edited (model/redwoodPlay.ts over the specs-mode bundle Play already loaded), or sent on
 * to the preview backend when the browser cannot answer it.
 *
 * The app owns its route (the frame's location hash); this element reports each change
 * (`play-route`) and moves the app when Play's chrome asks (`route` property → `navigate`).
 */
@customElement('redwood-play')
export class RedwoodPlay extends LitElement {
    static styles = css`
        :host { display: block; position: relative; width: 100%; height: 100%; min-height: 480px; }
        iframe { display: block; width: 100%; height: 100%; min-height: 480px; border: 0; background: #fff; }
        .notice { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 2rem;
                  background: var(--ve-canvas-bg, #fff); font: 13px/1.5 var(--ve-font, system-ui); color: var(--ve-text, #1f2329); }
        .notice > div { max-width: 34rem; }
        .notice h3 { margin: 0 0 .4rem; font-size: 14px; }
        .notice p { margin: .3rem 0; color: var(--ve-secondary, #5b6470); word-break: break-word; }
        .booting { position: absolute; top: .6rem; right: .8rem; font: 11px var(--ve-font, system-ui); color: var(--ve-tertiary, #9aa2ad); }
    `

    /** The route the app should be on ('' = the mount root). Changing it navigates the running app. */
    @property() route = ''
    /** The preview backend for what the browser cannot answer (server actions); '' = none. */
    @property() baseUrl = ''

    @state() private status: 'booting' | 'running' | 'offline' | 'unavailable' = 'booting'
    @state() private problem = ''
    @query('iframe') private frame?: HTMLIFrameElement

    /** The frame's src, fixed at boot: later routes travel as `navigate`, not as a reload. */
    private src = ''
    /** The route the app last said it is on. */
    private appRoute = ''
    private bootTimer?: number

    connectedCallback() {
        super.connectedCallback()
        this.src = redwoodPlayUrl(this.route)
        this.appRoute = routeOfHash(this.route)
        window.addEventListener('message', this.onMessage)
        this.bootTimer = window.setTimeout(() => {
            if (this.status === 'booting') this.fail('offline', `Nothing answered after ${Math.round(BOOT_TIMEOUT_MS / 1000)} s.`)
        }, BOOT_TIMEOUT_MS)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('message', this.onMessage)
        window.clearTimeout(this.bootTimer)
    }

    protected updated(changed: PropertyValues) {
        if (changed.has('route') && changed.get('route') !== undefined) {
            const wanted = routeOfHash(this.route)
            if (wanted !== this.appRoute) {
                this.appRoute = wanted
                this.post(navigateMessage(wanted))
            }
        }
    }

    render() {
        return html`
            ${this.status === 'offline' || this.status === 'unavailable' ? '' : html`
                <iframe title="Redwood — playing the app" src=${this.src}></iframe>`}
            ${this.status === 'booting' ? html`<div class="booting">Starting Redwood…</div>` : ''}
            ${this.status === 'offline' ? html`<div class="notice" role="alert"><div>
                <h3>Redwood needs Oracle's CDN, and it cannot be reached</h3>
                <p>The Redwood renderer loads Oracle JET, the Spectra components and the Visual Builder runtime from
                   static.oracle.com at run time (they are never bundled). ${this.problem}</p>
            </div></div>` : ''}
            ${this.status === 'unavailable' ? html`<div class="notice" role="alert"><div>
                <h3>The Redwood renderer is not available in this editor</h3>
                <p>${this.problem}</p>
            </div></div>` : ''}`
    }

    private post(msg: unknown) {
        try { this.frame?.contentWindow?.postMessage(msg, '*') } catch { /* frame gone */ }
    }

    private fail(status: 'offline' | 'unavailable', problem: string) {
        window.clearTimeout(this.bootTimer)
        this.status = status
        this.problem = problem
    }

    private onMessage = (e: MessageEvent) => {
        if (!this.frame || e.source !== this.frame.contentWindow) return
        const msg = frameMessageOf(e.data)
        if (msg) void this.handle(msg)
    }

    private async handle(msg: FrameToEditor) {
        switch (msg.mateuPreview) {
            case 'call': {
                if (this.status === 'booting') { this.status = 'running'; window.clearTimeout(this.bootTimer) }
                const { status, json } = await this.answer(msg.url, msg.body)
                this.post(answerMessage(msg.id, status, json))
                return
            }
            case 'route':
                this.appRoute = routeOfHash(msg.route)
                this.dispatchEvent(new CustomEvent('play-route', { detail: { route: this.appRoute }, bubbles: true, composed: true }))
                return
            case 'boot-failed':
                this.fail('offline', `This script could not be loaded: ${msg.url}.`)
                return
            case 'unavailable':
                this.fail('unavailable', msg.reason ? `The app could not be loaded (${msg.reason}).` : '')
                return
        }
    }

    /** What the app's backend would have said: from the files as edited, else the preview backend. */
    private async answer(url: string, body: Record<string, unknown>): Promise<{ status: number; json: unknown }> {
        await awaitBundle()
        const decision = answerPlayCall(url, body, resolveBundledLoad, !!this.baseUrl)
        if (decision.kind === 'answer') return { status: 200, json: decision.json }
        try {
            const res = await fetch(this.baseUrl.replace(/\/+$/, '') + decision.path, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}),
            })
            const text = await res.text()
            let json: unknown = {}
            try { json = text ? JSON.parse(text) : {} } catch { /* not JSON */ }
            return { status: res.status, json }
        } catch {
            return { status: 503, json: {} }
        }
    }
}

declare global {
    interface HTMLElementTagNameMap { 'redwood-play': RedwoodPlay }
}
