import { LitElement, css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import {
    BOOT_TIMEOUT_MS, PreviewFragment, frameMessageOf, redwoodPreviewUrl, renderMessage, selectMessage,
    type FrameToEditor,
} from './redwoodProtocol'
import { restSourceCatalogue } from '@infra/http/restSourceCatalogue.ts'
import { fieldTypeCatalogue } from '@infra/expander/fieldTypes.ts'

export type RedwoodFrameStatus = 'booting' | 'ready' | 'offline' | 'unavailable'

/**
 * The Redwood canvas: the REAL Redwood renderer (the Visual Builder app of io.mateu:mateu-redwood) in an
 * iframe, in editor-preview mode. The canvas hands it the increment it would have applied to its
 * own renderer; the app paints it and stamps the definition's node ids on what it paints, so a
 * click in the frame comes back as the node to select (`redwood-click`), and the selection is
 * outlined inside the frame (the editor cannot see a cross-origin frame's DOM).
 *
 * Needs Oracle's CDN (JET, the Spectra components and the visual runtime are never bundled): when
 * the app cannot start — a script failed to load, the browser is offline, or nothing answered in
 * time — the frame is replaced by a notice that says so.
 */
@customElement('redwood-frame')
export class RedwoodFrame extends LitElement {
    static styles = css`
        :host { display: block; position: relative; width: 100%; height: 100%; min-height: 420px; }
        iframe { display: block; width: 100%; height: 100%; min-height: 420px; border: 0; background: #fff; outline: none; }
        :host([dragging]) iframe { pointer-events: none; }
        .notice { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 2rem;
                  background: var(--ve-canvas-bg, #fff); font: 13px/1.5 var(--ve-font, system-ui); color: var(--ve-text, #1f2329); }
        .notice > div { max-width: 34rem; }
        .notice h3 { margin: 0 0 .4rem; font-size: 14px; }
        .notice p { margin: .3rem 0; color: var(--ve-secondary, #5b6470); word-break: break-word; }
        .notice button { margin-top: .6rem; font: inherit; padding: .3rem .8rem; border-radius: 6px; cursor: pointer;
                         border: 1px solid var(--ve-border, #d0d4da); background: var(--ve-surface, #f6f7f9); color: inherit; }
        .booting { position: absolute; top: .6rem; right: .8rem; font: 11px var(--ve-font, system-ui); color: var(--ve-tertiary, #9aa2ad); }
    `

    /** The selected node's editor id (`ve-…`) and the label of its outline. */
    @property() selectedId: string | null = null
    @property() selectedLabel = ''

    @state() status: RedwoodFrameStatus = 'booting'
    @state() private problem = ''
    @query('iframe') private frame?: HTMLIFrameElement

    private fragment?: PreviewFragment
    private hello = false
    private bootTimer?: number

    render() {
        return html`
            ${this.status === 'offline' || this.status === 'unavailable' ? '' : html`
                <iframe title="Redwood canvas" src=${redwoodPreviewUrl()}></iframe>`}
            ${this.status === 'booting' ? html`<div class="booting">Starting Redwood…</div>` : ''}
            ${this.status === 'offline' ? html`<div class="notice" role="alert"><div>
                <h3>Redwood needs Oracle's CDN, and it cannot be reached</h3>
                <p>The Redwood renderer loads Oracle JET, the Spectra components and the Visual Builder runtime from
                   static.oracle.com at run time (they are never bundled). ${this.problem}</p>
                <p>Check the network connection, a proxy or a content security policy — or switch the canvas to Vaadin to keep working offline.</p>
                <button @click=${this.retry}>Try again</button>
            </div></div>` : ''}
            ${this.status === 'unavailable' ? html`<div class="notice" role="alert"><div>
                <h3>The Redwood renderer is not available in this editor</h3>
                <p>${this.problem}</p>
                <p>This editor build does not bundle the Redwood app (io.mateu:mateu-redwood), and the configured backend does not serve one either.</p>
                <button @click=${this.retry}>Try again</button>
            </div></div>` : ''}
        `
    }

    connectedCallback() {
        super.connectedCallback()
        window.addEventListener('message', this.onMessage)
        window.addEventListener('online', this.onOnline)
        this.startBoot()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('message', this.onMessage)
        window.removeEventListener('online', this.onOnline)
        window.clearTimeout(this.bootTimer)
    }

    updated(changed: Map<string, unknown>) {
        if (changed.has('selectedId') || changed.has('selectedLabel')) this.sendSelection(changed.has('selectedId'))
    }

    /** Paints this fragment (sent now, or as soon as the app says hello). */
    show(fragment: PreviewFragment) {
        this.fragment = fragment
        if (this.hello) this.post(this.renderOf(fragment))
    }

    /** The render message: the fragment plus the project's catalogues (sources with their sample
     *  data, field types) — the frame previews with samples, as every canvas does. */
    private renderOf(fragment: PreviewFragment) {
        return renderMessage(fragment, { sources: restSourceCatalogue(), types: fieldTypeCatalogue() })
    }

    private startBoot() {
        this.hello = false
        window.clearTimeout(this.bootTimer)
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            this.fail('offline', 'The browser reports no network connection.')
            return
        }
        this.status = 'booting'
        this.bootTimer = window.setTimeout(() => {
            if (!this.hello) this.fail('offline', `Nothing answered after ${Math.round(BOOT_TIMEOUT_MS / 1000)} s.`)
        }, BOOT_TIMEOUT_MS)
    }

    private retry = () => {
        this.problem = ''
        this.startBoot()
    }

    private onOnline = () => { if (this.status === 'offline') this.retry() }

    private fail(status: 'offline' | 'unavailable', problem: string) {
        window.clearTimeout(this.bootTimer)
        this.status = status
        this.problem = problem
        this.dispatchEvent(new CustomEvent('redwood-status', { detail: { status, problem }, bubbles: true, composed: true }))
    }

    private post(msg: unknown) {
        try { this.frame?.contentWindow?.postMessage(msg, '*') } catch { /* frame gone */ }
    }

    private sendSelection(reveal: boolean) {
        if (this.hello) this.post(selectMessage(this.selectedId, this.selectedLabel, reveal))
    }

    private onMessage = (e: MessageEvent) => {
        // only our own frame — the editor's page receives the IDE host's messages too
        if (!this.frame || e.source !== this.frame.contentWindow) return
        const msg = frameMessageOf(e.data)
        if (!msg) return
        this.handle(msg)
    }

    private handle(msg: FrameToEditor) {
        switch (msg.mateuPreview) {
            case 'hello':
                this.hello = true
                window.clearTimeout(this.bootTimer)
                if (this.fragment) this.post(this.renderOf(this.fragment))
                this.sendSelection(false)
                return
            case 'rendered':
                if (this.status !== 'ready') {
                    this.status = 'ready'
                    this.dispatchEvent(new CustomEvent('redwood-status', { detail: { status: 'ready' }, bubbles: true, composed: true }))
                }
                this.sendSelection(false)
                return
            case 'click':
                this.dispatchEvent(new CustomEvent('redwood-click', { detail: { id: msg.id }, bubbles: true, composed: true }))
                return
            case 'key':
                // the editor's shortcuts (undo, delete, arrows) listen on its window
                window.dispatchEvent(new KeyboardEvent('keydown', {
                    key: msg.key, code: msg.code, metaKey: !!msg.metaKey, ctrlKey: !!msg.ctrlKey,
                    shiftKey: !!msg.shiftKey, altKey: !!msg.altKey, bubbles: true, cancelable: true,
                }))
                return
            case 'boot-failed':
                this.fail('offline', `This script could not be loaded: ${msg.url}.`)
                return
            case 'unavailable':
                this.fail('unavailable', msg.reason ? `The app could not be loaded (${msg.reason}).` : '')
                return
        }
    }
}

declare global {
    interface HTMLElementTagNameMap { 'redwood-frame': RedwoodFrame }
}
