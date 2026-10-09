import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { parse } from 'yaml'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { expandDefinition, isClientExpandable, DefinitionSpec } from '@infra/expander/expandDefinition.ts'
import '@infra/ui/mateu-ux.ts'

/** The width a screen is laid out at before it is shrunk into its card: a laptop, so it reads as one. */
const LAYOUT_WIDTH = 1100

/**
 * A screen in miniature: the page rendered for real (the same render the canvas uses — the preview
 * backend's `__preview__`, else the browser's expander) at a laptop width, then scaled down to the
 * card. Inert: a miniature is for recognising a screen, not for using it.
 *
 * Rendered only once its card scrolls into view, and one at a time across the board: a mount of
 * thirty screens is thirty renders, and a board you can pan should not wait for the ones off screen.
 */
@customElement('board-preview')
export class BoardPreview extends LitElement {
    static styles = css`
        :host { display: block; position: relative; overflow: hidden; background: var(--ve-canvas-bg, #fff); }
        .scaled { position: absolute; left: 0; top: 0; width: ${LAYOUT_WIDTH}px; transform-origin: 0 0; pointer-events: none; padding: 1rem 1.5rem; box-sizing: border-box; }
        .msg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center;
               padding: 0.75rem; font: 11px var(--ve-font, system-ui); color: var(--ve-tertiary, #9ca3af); }
        mateu-ux { display: block; }
    `

    /** The definition's YAML. */
    @property() content = ''
    @property() baseUrl = ''
    @property({ type: Boolean }) clientRender = false
    @property() theme: 'light' | 'dark' = 'light'
    /** Changes when the renderer does, so the miniature repaints in the new design system. */
    @property() renderer = ''

    @state() private msg?: string = 'Loading…'
    @state() private scale = 0.2
    @query('mateu-ux') private ux?: HTMLElement & { applyFragment: (f: unknown) => void }
    private observer?: IntersectionObserver
    private visible = false
    private painted?: string

    connectedCallback() {
        super.connectedCallback()
        this.observer = new IntersectionObserver((entries) => {
            this.visible = entries.some((e) => e.isIntersecting)
            if (this.visible) this.schedule()
        })
        this.observer.observe(this)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.observer?.disconnect()
    }

    render() {
        return html`
            <div class="scaled" style="transform: scale(${this.scale})" inert>
                <mateu-ux .preventNavigation=${true} theme=${this.theme}></mateu-ux>
            </div>
            ${this.msg ? html`<div class="msg">${this.msg}</div>` : ''}`
    }

    protected firstUpdated() {
        this.scale = this.clientWidth / LAYOUT_WIDTH || 0.2
    }

    protected updated(changed: PropertyValues) {
        if (changed.has('content') || changed.has('baseUrl') || changed.has('clientRender') || changed.has('renderer')) this.schedule()
    }

    private schedule() {
        const key = `${this.content}|${this.baseUrl}|${this.clientRender}|${this.renderer}`
        if (!this.visible || key === this.painted) return
        this.painted = key
        queue = queue.then(() => this.paint()).catch(() => {})
    }

    private async paint() {
        if (!this.isConnected) return
        const fragment = await this.fragment()
        if (!fragment) return
        this.msg = undefined
        await this.updateComplete
        this.ux?.applyFragment(fragment)
        // Let the renderer's web components settle before the next card takes the main thread.
        await new Promise((r) => setTimeout(r, 60))
    }

    private async fragment(): Promise<unknown | undefined> {
        let spec: DefinitionSpec
        try { spec = parse(this.content) as DefinitionSpec } catch { this.msg = 'The YAML does not parse'; return undefined }
        if (!this.clientRender) {
            try {
                const increment: any = await mateuApiClient.runAction(
                    this.baseUrl, '', '', '__preview__', 've-board',
                    undefined, undefined, {}, { _yaml: this.content }, this, false,
                )
                const fragment = increment?.fragments?.[0]
                if (fragment) return fragment
            } catch { /* no backend: the browser render below */ }
        }
        if (!isClientExpandable(spec)) { this.msg = 'Needs its view model — preview it with a backend'; return undefined }
        try {
            return expandDefinition(spec, 'preview')?.fragments?.[0]
        } catch (e: any) {
            this.msg = e?.message ?? String(e)
            return undefined
        }
    }
}

/** One miniature renders at a time, board-wide. */
let queue: Promise<void> = Promise.resolve()

declare global {
    interface HTMLElementTagNameMap { 'board-preview': BoardPreview }
}
