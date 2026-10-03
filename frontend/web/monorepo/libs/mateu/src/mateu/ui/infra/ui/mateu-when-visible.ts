import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

/**
 * Renders its content only once it becomes visible — the lazy half of `@Subresource(load =
 * ON_OPEN)`: an embedded listing in a tab that is not open sits in a hidden panel, so it is not
 * fetched until the user opens that tab (decision D2: tabs are lazy by default). Once shown it stays
 * rendered.
 *
 * Light DOM, so the island inside keeps receiving and re-dispatching the ordinary action events.
 */
@customElement('mateu-when-visible')
export class MateuWhenVisible extends LitElement {

    /** The content to render once visible. */
    @property({ attribute: false })
    content: (() => TemplateResult) | undefined

    @state()
    private shown = false

    private observer: IntersectionObserver | undefined

    protected createRenderRoot() {
        return this
    }

    connectedCallback() {
        super.connectedCallback()
        if (this.shown) return
        if (typeof IntersectionObserver === 'undefined') {
            this.shown = true
            return
        }
        this.observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                this.shown = true
                this.observer?.disconnect()
                this.observer = undefined
            }
        })
        this.observer.observe(this)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.observer?.disconnect()
        this.observer = undefined
    }

    render() {
        if (this.shown && this.content) return this.content()
        return html`<div class="mateu-when-visible-placeholder" style="min-height: 1px;">${nothing}</div>`
    }
}

/** Whether a mediator's home route asks to be loaded only when shown (`_lazy=1`). */
export const isLazyRoute = (route: string | undefined): boolean =>
    !!route && /[?&]_lazy=1(&|$)/.test(route)
